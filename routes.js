const express = require('express');
const path = require('path');
const mysql = require("mysql2");
const { and } = require('sequelize').Op;
const { Client, City, Service, Specialist, Clinic, Contract } = require("./db");

const db = mysql.createConnection({
    host: "localhost",
    user: "Kenyo",
    database: "clinic_db",
    password: "N!njad3vper"
});


const router = express.Router();

const initQuery = () => {
    return `select ContractCode, C.CityName, C2.ClinicName, C3.ClientName, S.ServiceName, ST.SpecialistTypeDescription from Contract
    left join City C on Contract.CityCode = C.CityCode
    left join (select ClinicCode, ClinicName from Clinic group by ClinicCode, ClinicName) C2 on Contract.ClinicCode = C2.ClinicCode
    left join Client C3 on Contract.ClientCode = C3.ClientCode
    left join Service S on Contract.ServiceCode = S.ServiceCode
    left join SpecialistType ST on Contract.SpecialistCode = ST.SpecialistCode;`;
};


router.get('/', (req, res) => {
    db.query(initQuery(), (err, results) => {
        if (err) res.send(err.message);
        else {
            res.render('index', { result: results });
        }
    });
});

router.get('/add', async (req, res) => {
    let result = {};

    result.cities = (await City.findAll().then(v => v))
        .map(item => item.dataValues);

    result.clinics = (await Clinic.findAll().then(v => v))
        .map(item => item.dataValues);

    result.specialists = (await Specialist.findAll().then(v => v))
        .map(item => item.dataValues);
    
    result.services = (await Service.findAll().then(v => v))
        .map(item => item.dataValues);
    
    res.render('add', {
        cities: result.cities,
        clinics: result.clinics,
        specialists: result.specialists,
        services: result.services
    });
});

router.post('/add', async (req, res) => {
    const { clientName, clientSurname, clientPhone, city, clinic, specialist, service } = req.body;
    const [ client, created ] = await Client.findOrCreate(
        { where:
            {
                clientName: clientName,
                clientSurname: clientSurname,
                clientPhone: clientPhone
            }
        }
    ).then(v => v);

    const clinicCode = await Clinic.findOne({ where: { clinicName: clinic } })
        .then(v => v.dataValues.clinicCode);

    const cityCode = await City.findOne({ where: { cityName: city } })
        .then(v => v.dataValues.cityCode);

    const serviceCode = await Service.findOne({ where: { serviceName: service } })
        .then(v => v.dataValues.serviceCode);

    console.log(serviceCode);

    const specialistSplit = specialist.split(' ');

    const specialistCode =  await Specialist.findOne({ where: { 
        specialistName: specialistSplit[1],
        specialistSurname: specialistSplit[2],
        specialistTypeDescription: specialistSplit[0]
    } })
        .then(v => v.dataValues.specialistCode);
    
    Contract.create({
        clientCode: client.clientCode,
        clinicCode: clinicCode,
        specialistCode: specialistCode,
        cityCode: cityCode,
        serviceCode: serviceCode
    });

    res.redirect('/');
});

router.get('/delete', (req, res) => {
    res.render('delete');
});

router.post('/delete', (req, res) => {
    const { contractId } = req.body;

    Contract.destroy({ where : { contractCode: contractId } })
        .then(v => v);
    
    res.redirect('/');
});

router.get('/manage', (req, res) => {
    res.render('manage');
});


module.exports = router;