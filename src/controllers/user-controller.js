const mysql = require('../connection');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

module.exports = {

    getAllUser: async (request, response) => {
        try {
            const { nome } = request.query;

            let query = 
                `SELECT
                    usuarios.id,
                    usuarios.nome,
                    usuarios.email,
                    usuarios.telefone,
                    CASE
                        WHEN usuarios.status_usuario = 0 THEN 'Inativo'
                        WHEN usuarios.status_usuario = 1 THEN 'Ativo'
                        ELSE 'Desconhecido'
                    END AS status,
                    usuarios.cargo
                FROM usuarios;`;

            if (nome) {
                query += ` WHERE usuarios.nome LIKE ?`;
            }

            const [result] = await mysql.execute(query, [`%${nome}%`]);
            return response.status(200).json(result);
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    getUserById: async (request, response) => {
        try {
            const query = 
                `SELECT
                    usuarios.id,
                    usuarios.nome,
                    usuarios.email,
                    usuarios.telefone,
                    CASE
                        WHEN usuarios.status_usuario = 0 THEN 'Inativo'
                        WHEN usuarios.status_usuario = 1 THEN 'Ativo'
                        ELSE 'Desconhecido' -- Adicione um valor padrão caso o status não seja 0 ou 1
                    END AS status,
                    usuarios.cargo
                FROM usuarios
                WHERE usuarios.id = ?;`;

            const [result] = await mysql.execute(query, [request.params.id]);
            return response.status(200).json(result);
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    getLogs: async (request, response) => {
        try {
            const query = 
                `SELECT 
                    registros.id, 
                    registros.data_registro, 
                    usuarios.id AS id_usuario, 
                    usuarios.nome AS usuario,
                    acoes.id AS id_acao,
                    acoes.nome AS acao,
                    registros.descricao
                FROM registros 
                INNER JOIN usuarios ON registros.id_usuario = usuarios.id
                INNER JOIN acoes ON registros.id_acao = acoes.id`;
            
            const [result] = await mysql.execute(query);
            return response.status(200).json(result);
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    createUser: async (request, response) => {
        try {
            const { nome, email, telefone, cargo } = request.body;

            const [usuarioExistente] = await mysql.execute('SELECT id FROM usuarios WHERE email = ?', [email]);

            if (usuarioExistente.length > 0) {
                return response.status(400).json({ message: 'Este usuário já está cadastrado' });
            }

            const senha = 'senha123'

            const senhaHash = await bcrypt.hash(senha, 10);

            const query = 
                `INSERT INTO usuarios
                    (nome, email, senha, telefone, status_usuario, cargo)
                VALUES
                    (?, ?, ?, ?, ?, ?)`;

            const [result] = await mysql.execute(query, [nome, email, senhaHash, telefone, 1, cargo]);

            return response.status(201).json({ message: 'Usuário cadastrado com sucesso!', id: result.id});
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    userLogin: async (request, response) => {
        try {
            const { email, senha } = request.body;

            const [result] = await mysql.execute('SELECT * FROM usuarios WHERE email = ?', [email]);

            if (result.length === 0) {
                return response.status(401).json({ message: 'Usuário não encontrado' });
            }

            const user = result[0];

            const senhaValida = await bcrypt.compare(senha, user.senha);

            if (!senhaValida) {
                return response.status(401).json({ message: 'Senha incorreta' });
            }

            const token = jwt.sign({
                id_usuario: user.id,
                nome: user.nome,
                email: user.email,
                status: user.status_usuario,
                cargo: user.cargo
            }, process.env.JWT_KEY, {
                expiresIn: '1h'
            });

            return response.status(200).json({ 
                message: 'Autenticado com sucesso', 
                id_usuario: user.id,
                nome: user.nome,
                email: user.email,
                status: user.status_usuario,
                cargo: user.cargo,
                token 
            });
        } catch (error) {
            console.error('Erro ao efetuar login:', error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    identifyUser: async (request, response) => {
        try {
            const authHeader = request.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];

            if (token == null) {
                return response.status(401).send("Token não fornecido.");
            }

            jwt.verify(token, process.env.JWT_KEY, (error, decoded) => {
                if (error) {
                    console.error("Ocorreu um erro ao verificar o token:", error);
                    return response.status(403).send("Token inválido.");
                }
                
                request.user = decoded;
                response.json(decoded);
            });
        } catch (error) {
            console.error("Ocorreu um erro:", error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    updatePassword: async (request, response) => {
        try {
            const { senha_atual, senha_nova } = request.body;
    
            const [result] = await mysql.execute('SELECT senha FROM usuarios WHERE id = ?', [request.params.id]);
    
            if (senha_atual && result.length > 0 && result[0].senha) {
                const senhaCorreta = await bcrypt.compare(senha_atual, result[0].senha);
    
                if (senhaCorreta) {
                    const senhaHash = await bcrypt.hash(senha_nova, 10);
    
                    const updateQuery = 'UPDATE usuarios SET senha = ? WHERE id = ?';
                    await mysql.execute(updateQuery, [senhaHash, request.params.id]);
    
                    return response.status(200).json({ message: 'Senha atualizada com sucesso!' });
                } else {
                    return response.status(400).json({ message: 'Senha atual incorreta!' });
                }
            } else {
                return response.status(400).json({ message: 'Senha atual não informada ou usuário não encontrado!' });
            }
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },    

    updateUser: async (request, response) => {
        try {
            const { nome, email, telefone, status, cargo } = request.body;

            const [usuarioExistente] = await mysql.execute('SELECT id FROM usuarios WHERE email = ?', [email]);

            if (usuarioExistente.length > 0) {
                return response.status(400).json({ message: 'Este usuário já está cadastrado' });
            }

            const query = 
                `UPDATE usuarios
                SET nome = ?, email = ?, telefone = ?, status_usuario = ?, cargo = ?
                WHERE id = ?`;

            await mysql.execute(query, [nome, email, telefone, status, cargo, request.params.id]);
            return response.status(201).json({ message: 'Usuário atualizado com sucesso!' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    disableUser: async (request, response) => {
        try {
            const query = 
                `UPDATE usuarios
                SET status_usuario = 0
                WHERE id = ?`;

            await mysql.execute(query, [request.params.id]);
            return response.status(200).json({ message: 'Usuário desativado com sucesso!' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    enableUser: async (request, response) => {
        try {
            const query = 
                `UPDATE usuarios
                SET status_usuario = 1
                WHERE id = ?`;

            await mysql.execute(query, [request.params.id]);
            return response.status(200).json({ message: 'Usuário ativado com sucesso!' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    deleteUser: async (request, response) => {
        try {
            const query = 
                `DELETE FROM usuarios
                WHERE id = ?`;

            await mysql.execute(query, [request.params.id]);
            return response.status(200).json({ message: 'Usuário deletado com sucesso!' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    }
    
};
