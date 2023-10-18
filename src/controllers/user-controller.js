const mysql = require('../connection');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// const crypto = require('crypto');
// const mailer = require('../modules/mailer');
require('dotenv').config();

module.exports = {

    getAllUsers: async (request, response) => {
        try {
            const { id, nome, email, telefone, cargo } = request.query;
    
            let query = 
                `SELECT
                    usuarios.id,
                    usuarios.nome,
                    usuarios.email,
                    usuarios.telefone,
                    usuarios.status_usuario,
                    usuarios.cargo
                FROM usuarios
                WHERE 1=1`;
    
            const params = [];
    
            if (id) {
                query += ` AND usuarios.id = ?`;
                params.push(id);
            }
    
            if (nome) {
                query += ` AND usuarios.nome LIKE ?`;
                params.push(`%${nome}%`);
            }
    
            if (email) {
                query += ` AND usuarios.email LIKE ?`;
                params.push(`%${email}%`);
            }
    
            if (telefone) {
                query += ` AND usuarios.telefone LIKE ?`;
                params.push(`%${telefone}%`);
            }
    
            if (cargo) {
                query += ` AND usuarios.cargo LIKE ?`;
                params.push(`%${cargo}%`);
            }
    
            const [result] = await mysql.execute(query, params);
            return response.status(200).json(result);
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    getLogs: async (request, response) => {
        try {
            const { nome_usuario, data, data_inicial, data_final } = request.query;
    
            let query = `
                SELECT 
                    registros.id, 
                    registros.data_registro,
                    usuarios.id AS id_usuario, 
                    usuarios.nome AS usuario,
                    acoes.id AS id_acao,
                    acoes.nome AS acao,
                    registros.descricao
                FROM registros 
                INNER JOIN usuarios ON registros.id_usuario = usuarios.id
                INNER JOIN acoes ON registros.id_acao = acoes.id
                WHERE 1=1
            `;
    
            const params = [];
    
            if (nome_usuario) {
                query += ' AND usuarios.nome LIKE ?';
                params.push(`%${nome_usuario}%`);
            }
    
            if (data_inicial && data_final) {
                query += ' AND registros.data_registro BETWEEN ? AND ?';
                params.push(data_inicial, data_final);
            } else if (data_inicial) {
                query += ' AND registros.data_registro >= ?';
                params.push(data_inicial);
            } else if (data_final) {
                query += ' AND registros.data_registro <= ?';
                params.push(data_final);
            }
    
            const [result] = await mysql.execute(query, params);
            return response.status(200).json(result);
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },               

    createUser: async (request, response) => {
        try {
            const { nome, email, telefone, cargo } = request.body;

            const [usuario_existente] = await mysql.execute('SELECT id FROM usuarios WHERE email = ?', [email]);

            if (usuario_existente.affectedRows > 0) {
                return response.status(409).json({ message: 'Este usuário já está cadastrado' });
            }

            const senha = 'senha123'

            const senhaHash = await bcrypt.hash(senha, 10);

            const query = 
                `INSERT INTO usuarios
                    (nome, email, senha, telefone, status_usuario, cargo)
                VALUES
                    (?, ?, ?, ?, ?, ?)`;

            const [result] = await mysql.execute(query, [nome, email, senhaHash, telefone, 1, cargo]);

            return response.status(201).json({ message: 'Usuário cadastrado com sucesso' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    userLogin: async (request, response) => {
        try {
            const { email, senha } = request.body;

            const [result] = await mysql.execute('SELECT * FROM usuarios WHERE email = ?', [email]);

            if (result.affectedRows === 0) {
                return response.status(404).json({ message: 'Usuário não encontrado' });
            }

            const user = result[0];

            const senha_valida = await bcrypt.compare(senha, user.senha);

            if (!senha_valida) {
                return response.status(401).json({ message: 'Usuário ou senha inválidos' });
            }

            const token = jwt.sign({
                id: user.id,
                nome: user.nome,
                email: user.email,
                telefone: user.telefone,
                status_usuario: user.status_usuario,
                cargo: user.cargo
            }, process.env.JWT_KEY, {
                expiresIn: '5 days'
            });

            return response.status(200).json({ 
                message: 'Autenticado com sucesso', 
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

    // forgotPassword: async (request, response) => {
    //     try {
    //         const { email } = request.body;
    
    //         const [result] = await mysql.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
    
    //         if (!result || result.length === 0) {
    //             return response.status(404).json({ message: 'Usuário não encontrado' });
    //         }
            
    //         const token = crypto.randomBytes(20).toString('hex');

    //         const now = new Date();
    //         now.setHours(now.getHours() + 1);

    //         await mysql.execute('UPDATE usuarios SET passwordResetToken = ?, passwordResetExpires = ? WHERE email = ?', [token, now, email]);

    //         mailer.sendMail({
    //             from: process.env.MAILER_USER,
    //             to: email,
    //             subject: 'Recuperação de senha',
    //             text: `Olá, ${result[0].nome}, utilize o token ${token} para recuperar sua senha`,
    //         }, (error) => {
    //             if (error) {
    //                 console.error(error);
    //                 return response.status(500).json({ message: 'Erro ao enviar o e-mail de recuperação de senha' });
    //             } else {
    //                 return response.status(200).json({ message: 'E-mail enviado com sucesso' });
    //             }
    //         });

    //     } catch (error) {
    //         console.error(error);
    //         return response.status(500).json({ message: 'Erro interno do servidor' });
    //     }
    // },  
    
    // updatePassword: async (request, response) => {
    //     try {
    //         const { email, token, senha } = request.body;

    //         const [result] = await mysql.execute('SELECT * FROM usuarios WHERE email = ?', [email]);

    //         if (!result || result.length === 0) {
    //             return response.status(404).json({ message: 'Usuário não encontrado' });
    //         }

    //         if (token !== result[0].passwordResetToken) {
    //             return response.status(401).json({ message: 'Token inválido' });
    //         }

    //         const now = new Date();

    //         if (now > result[0].passwordResetExpires) {
    //             return response.status(401).json({ message: 'Token expirado' });
    //         }

    //         const senhaHash = await bcrypt.hash(senha, 10);

    //         await mysql.execute('UPDATE usuarios SET senha = ? WHERE email = ?', [senhaHash, email]);
    //         return response.status(200).json({ message: 'Senha atualizada com sucesso' });
    //     } catch (error) {
    //         console.error(error);
    //         return response.status(500).json({ message: 'Erro interno do servidor' });
    //     }
    // },

    updatePassword: async (request, response) => {
        try {
            const { email, senha_atual, senha_nova } = request.body;
    
            const [result] = await mysql.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
    
            if (!result || result.affectedRows === 0) {
                return response.status(404).json({ message: 'Usuário não encontrado' });
            }
    
            const senha_valida = await bcrypt.compare(senha_atual, result[0].senha);
    
            if (!senha_valida) {
                return response.status(401).json({ message: 'Senha atual inválida' });
            }
    
            if (senha_atual === senha_nova) {
                return response.status(401).json({ message: 'A nova senha deve ser diferente da atual' });
            }
    
            const senhaHash = await bcrypt.hash(senha_nova, 10);
    
            await mysql.execute('UPDATE usuarios SET senha = ? WHERE email = ?', [senhaHash, email]);
            return response.status(200).json({ message: 'Senha atualizada com sucesso' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },    

    updateUser: async (request, response) => {
        try {
            const token = request.header('Authorization');
            const decodedToken = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_KEY);
            const { nome, email, telefone, status_usuario, cargo } = request.body;
    
            const [usuario] = await mysql.execute('SELECT id FROM usuarios WHERE id = ?', [request.params.id]);
    
            if (usuario.length === 0) {
                return response.status(409).json({ message: 'Usuário não encontrado' });
            }
    
            if (decodedToken.email !== email) {
                const [user_email] = await mysql.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
    
                if (user_email.length > 0) {
                    return response.status(409).json({ message: 'Este e-mail já está cadastrado' });
                }
            }
    
            const query = 
                `UPDATE usuarios
                SET nome = ?, email = ?, telefone = ?, status_usuario = ?, cargo = ?
                WHERE id = ?`;
    
            await mysql.execute(query, [nome, email, telefone, status_usuario, cargo, request.params.id]);
    
            return response.status(201).json({ message: 'Usuário atualizado com sucesso' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },    

    disableUser: async (request, response) => {
        try {
            const query = 
                `UPDATE usuarios
                SET status_usuario = "Inativo"
                WHERE id = ?`;
    
            const [result] = await mysql.execute(query, [request.params.id]);
    
            if (result.affectedRows === 0) {
                return response.status(404).json({ message: 'Usuário não encontrado' });
            }
    
            return response.status(200).json({ message: 'Usuário desativado com sucesso' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    
    enableUser: async (request, response) => {
        try {
            const query = 
                `UPDATE usuarios
                SET status_usuario = "Ativo"
                WHERE id = ?`;
    
            const [result] = await mysql.execute(query, [request.params.id]);
    
            if (result.affectedRows === 0) {
                return response.status(404).json({ message: 'Usuário não encontrado' });
            }
    
            return response.status(200).json({ message: 'Usuário ativado com sucesso' });
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
    
            const [result] = await mysql.execute(query, [request.params.id]);
    
            if (!result || result.affectedRows === 0) {
                return response.status(404).json({ message: 'Usuário não encontrado' });
            }
    
            return response.status(200).json({ message: 'Usuário deletado com sucesso' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    }    
    
};
