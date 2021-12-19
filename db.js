const { Sequelize, DataTypes} = require("sequelize");

const sequelize = new Sequelize('clinic_db', 'Kenyo', 'N!njad3vper', {
    host: 'localhost',
    dialect: 'mysql'
});

const defaultConfig = {
    freezeTableName: true,
    timestamps: false
};

const City = sequelize.define('City', {
    cityCode: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: "CityCode"
    },
    cityName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'CityName',
        unique: true
    }
}, defaultConfig);

const Client = sequelize.define('Client', {
    clientCode: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: "ClientCode"
    },
    clientName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "ClientName"
    },
    clientSurname: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "ClientSurname"
    },
    clientPhone: {
        type: DataTypes.CHAR(11),
        allowNull: false,
        field: "ClientPhoneNumber"
    }
}, defaultConfig);

const Clinic = sequelize.define('Clinic', {
    clinicCode: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: "ClinicCode"
    },
    cityCode: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        field: "CityCode",
        references: {
            model: "City",
            key: 'CityCode'
        }
    },
    clinicName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "ClinicName",
        unique: true
    }
}, defaultConfig);

const Specialist = sequelize.define('SpecialistType', {
    specialistCode: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: "SpecialistCode"
    },
    clinicCode: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        field: "ClinicCode",
        references: {
            model: 'Clinic',
            key: 'ClinicCode'
        }
    },
    specialistTypeDescription: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: "SpecialistTypeDescription"
    },
    specialistName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "SpecialistName"
    },
    specialistSurname: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "SpecialistSurname"
    }
}, defaultConfig);

const Service = sequelize.define('Service', {
    serviceCode: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: "ServiceCode"
    },
    servicePrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
        field: "ServicePrice"
    },
    serviceName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "ServiceName",
        unique: true
    }
}, defaultConfig);

const Contract = sequelize.define('Contract', {
    contractCode: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: "ContractCode"
    },
    clientCode: {
        type: DataTypes.BIGINT.UNSIGNED,
        field: 'ClientCode',
        references: {
            model: 'Client',
            key: 'ClientCode'
        },
        allowNull: false
    },
    serviceCode: {
        type: DataTypes.BIGINT.UNSIGNED,
        field: 'ServiceCode',
        references: {
            model: 'Service',
            key: 'ServiceCode'
        },
        allowNull: false
    },
    clinicCode: {
        type: DataTypes.BIGINT.UNSIGNED,
        field: 'ClinicCode',
        references: {
            model: 'Clinic',
            key: 'ClinicCode'
        },
        allowNull: false
    },
    cityCode: {
        type: DataTypes.BIGINT.UNSIGNED,
        field: 'CityCode',
        references: {
            model: 'City',
            key: 'CityCode'
        },
        allowNull: false
    },
    specialistCode: {
        type: DataTypes.BIGINT.UNSIGNED,
        field: 'SpecialistCode',
        references: {
            model: 'SpecialistType',
            key: 'SpecialistCode'
        },
        allowNull: false
    }
}, defaultConfig);

Clinic.hasMany(Specialist, { foreignKey: "ClinicCode" });
Clinic.belongsTo(City, { foreignKey: "CityCode" });
Clinic.hasMany(Contract, { foreignKey: "ContractCode" });

City.hasMany(Contract, { foreignKey: "ContractCode" });
City.hasMany(Clinic, { foreignKey: "CityCode" });

Client.hasMany(Contract, { foreignKey: "ContractCode" });

Service.hasMany(Contract, { foreignKey: "ContractCode" });

Specialist.hasMany(Contract, { foreignKey: "ContractCode" });
Specialist.belongsTo(Clinic, { foreignKey: "ClinicCode" });

Contract.belongsTo(Client, { foreignKey: "ClientCode" });
Contract.belongsTo(City, { foreignKey: "CityCode" });
Contract.belongsTo(Clinic, { foreignKey: "ClinicCode" });
Contract.belongsTo(Service, { foreignKey: "ServiceCode" });
Contract.belongsTo(Specialist, { foreignKey: "SpecialistCode" });

sequelize.sync();

module.exports = { Client, City, Specialist, Clinic, Service, Contract };