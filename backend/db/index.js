const { Pool } = require('pg')

const pool = new Pool({
    user: 'admin',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432
})

const DataTypes = {
    int8: 'int8',
    serial8: 'serial8',
    bit: (n) => `bit(${n})`,
    varbit: (n) => `varbit(${n})`,
    boolean: 'bool',
    char: (n) => `char(${n})`,
    varchar: (n) => `varchar(${n})`,
    date: 'date',
    decimal: (p, s) => `decimal(${p}, ${s})`,
    timestampz: 'timestamp with time zone',
    time: 'time',
    float: 'float8'
}

const Constraints = {
    NOT_NULL: 'NOT NULL',
    UNIQUE: 'UNIQUE',
    PRIMARY: (...f) => `PRIMARY KEY${f && f.length > 0 ? ` (${f.join(', ')})` : ''}`,
    FOREIGN: (f, t, r) => `FOREIGN KEY (${f}) REFERENCES ${t} (${r})`,
    CHECK: 'CHECK',
    DEFAULT: (v) => `DEFAULT ${v}`

}

const tables = {
    Manufacturer: {
        unique: ['id'],
        fields: {
            id: {
                datatype: DataTypes.char(6),
                constraints: [
                    Constraints.PRIMARY()
                ]
            },
            name: {
                datatype: DataTypes.varchar(20),
                constraints: [
                    Constraints.NOT_NULL
                ]
            }
        }
    },
    Network: {
        unique: ['homeId'],
        fields: {
            homeId: {
                datatype: DataTypes.varchar(10),
                constraints: [
                    Constraints.PRIMARY()
                ]
            },
            zjsVersion: {
                datatype: DataTypes.varchar(10),
                constraints: [
                    Constraints.NOT_NULL
                ]
            },
            lastUpdate: {
                datatype: DataTypes.timestampz,
                constraints: [
                    Constraints.DEFAULT('CURRENT_TIMESTAMP')
                ]
            }
        }
    },
    Device: {
        unique: ['nodeId', 'network'],
        fields: {
            nodeId: {
                datatype: DataTypes.int8
            },
            network: {
                datatype: DataTypes.varchar(10),
                constraints: [
                    Constraints.NOT_NULL
                ]
            },
            manufacturer: {
                datatype: DataTypes.char(6),
                constraints: [
                    Constraints.NOT_NULL
                ]
            },
            prodType: {
                datatype: DataTypes.char(6),
                constraints: [
                    Constraints.NOT_NULL
                ]
            },
            prodId: {
                datatype: DataTypes.char(6),
                constraints: [
                    Constraints.NOT_NULL
                ]
            },
            created: {
                datatype: DataTypes.timestampz,
                constraints: [
                    Constraints.DEFAULT('CURRENT_TIMESTAMP')
                ]
            }
        },
        constraints: [
            Constraints.PRIMARY('nodeId', 'network'),
            Constraints.FOREIGN('network', 'Network', 'homeId')
        ]
    }
}

module.exports = {
    query: (text, params) => {
        const start = Date.now()
        return pool.query(text, params).then((res) => {
            const duration = Date.now() - start
            console.log('executed query', { text, duration, rows: res.rowCount })
            return res
        })
    },
    upsert: async (table, values) => {
        /*
        INSERT INTO students(id, firstname, lastname, gender, d_o_b, email)
        VALUES (1516, 'Gerardo', 'Wood', 'M', 'January 27 1995', 'gerardo_woodka@gmail.com')
        ON CONFLICT (id) DO UPDATE SET firstname = EXCLUDED.firstname, lastname = EXCLUDED.lastname;
        */
        const fields = Object.keys(tables[table].fields)
        const unique = tables[table].unique
        const notUniqe = fields.filter(f => !unique.includes(f))

        const skipFields = []

        const valuesInsert = values.map(v => {
            const orderedList = []
            for (const f of fields) {
                if (v[f] !== undefined) {
                    orderedList.push(v[f])
                } else {
                    skipFields.push(f)
                }
            }
            return `(${orderedList.map(l => typeof l === 'number' ? l : `'${l}'`).join(', ')})`
        })

        const upsert = notUniqe.filter(f => !skipFields.includes(f)).map(f => {
            return `${f} = EXCLUDED.${f}`
        })

        const query = `INSERT INTO ${table} (${fields.filter(f => !skipFields.includes(f)).join(', ')})\nVALUES\n${valuesInsert.join(',\n')}\n ON CONFLICT (${unique.join(', ')})  DO UPDATE SET ${upsert.join(', ')};`
        console.log(query)

        return pool.query(query)
    },
    init: async () => {
        for (const table of Object.keys(tables)) {
            const conf = tables[table]
            const fields = Object.keys(conf.fields).map((f) =>
                `${f} ${conf.fields[f].datatype}${conf.fields[f].constraints ? ' ' + conf.fields[f].constraints.join(' ') : ''}`
            )
            const query = `CREATE TABLE IF NOT EXISTS ${table} (\n${fields.join(',\n')}${conf.constraints ? ',\n' + conf.constraints.join(',\n') : ''}\n);`
            console.log(query)
            await pool.query(query)
        }
    },
    dropAll: async () => {
        const query = `DROP TABLE IF EXISTS ${Object.keys(tables).join(', ')} CASCADE;`
        console.log(query)
        await pool.query(query)
    }
}
// module.exports.dropAll()
// module.exports.init()
module.exports.upsert('Network', [{ homeId: 'fsedfsfgrr', zjsVersion: '7.0.0', lastUpdate: new Date().toISOString() }]).catch(console.log)
//module.exports.upsert('Device', [{ network: 'fsedfsfgrr', nodeId: 10, manufacturer: '0x0000', prodType: '0x0000', prodId: '0x0000' }]).catch(console.log)
