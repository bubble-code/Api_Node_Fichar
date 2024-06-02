// server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql');

const app = express();
const port = 3000;

// Configurar body-parser para manejar datos JSON
app.use(bodyParser.json());
app.use(cors());

// Configuración de la conexión a la base de datos
const dbConfig = {
    user: 'sa',
    password: 'Altai2021',
    server: 'SRVSQL',
    database: 'SolmicroERP6_Favram',
    options: {
        encrypt: false, // Usar solo si tu servidor SQL lo requiere
        enableArithAbort: true
    }
};

// Endpoint para registrar la entrada
app.post('/registroEntrada', async (req, res) => {
    try {
        console.log("Llamada desde /registroEntrada");
        // Conectar a la base de datos
        let { empleadoId, entrada } = req.body;
        
        // Conectar a la base de datos
        let pool = await sql.connect(dbConfig);
        // Generar valores necesarios
        let idControlPresencia = await pool.request()
            .execute('xAutoNumericValue');// Generar un ID único, ajusta esto según tus necesidades
        let fecha = new Date();
        let fechaHoraActual = new Date().toISOString().replace('T', ' ').substring(0, 19); // Formato: "YYYY-MM-DD HH:MM:SS"
        let fechaCreacionAudi = fecha;
        let fechaModificacionAudi = fecha;
        let usuarioCreacionAudi = 'favram\\cm.verdu';

        let result = await pool.request()
            .input('IDControlPresencia', sql.Int, idControlPresencia.recordset[0].value)
            .input('IDOperario', sql.NVarChar(10), empleadoId)
            .input('Fecha', sql.Date, fecha)
            .input('Hora', sql.Time, fechaHoraActual)
            .input('Entrada', sql.Bit, entrada) // Asumimos que entrada es un booleano
            .input('FechaCreacionAudi', sql.DateTime, fechaCreacionAudi)
            .input('FechaModificacionAudi', sql.DateTime, fechaModificacionAudi)
            .input('UsuarioAudi', sql.VarChar, usuarioCreacionAudi)
            .input('UsuarioCreacionAudi', sql.VarChar, usuarioCreacionAudi)
            .query('INSERT INTO tbControlPresencia (IDControlPresencia, IDOperario, Fecha, Hora, Entrada, FechaCreacionAudi, FechaModificacionAudi, UsuarioAudi, UsuarioCreacionAudi) VALUES (@IDControlPresencia, @IDOperario, @Fecha, @Hora, @Entrada, @FechaCreacionAudi, @FechaModificacionAudi, @UsuarioAudi, @usuarioCreacionAudi)');

        res.status(200).send('Registro de entrada insertado');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al insertar el registro');
    }
});

app.get('/', async (req, res) => {
    console.log('Llamada recibida en /');
    let empleadoId = req.body.empleadoId;
    let pool = await sql.connect(dbConfig);
    let result = await pool.request()
        .execute('xAutoNumericValue');
    let idControlPresencia = result.recordset[0].value;
    let stringQuery = `INSERT INTO tbControlPresencia (IDControlPresencia,IDOperario,Fecha,Hora,Entrada,FechaCreacionAudi,FechaModificacionAudi,UsuarioAudi,UsuarioCreacionAudi) VALUES (${idControlPresencia},${empleadoId},@Fecha,@Hora,@Entrada,@FechaCreacionAudi,@FechaModificacionAudi,@UsuarioAudi,@UsuarioCreacionAudi)`
    res.status(200).json(result.recordset[0].value);
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
