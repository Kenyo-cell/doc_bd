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

const tableNameMap = {
    'Contract Code': 'ContractCode',
    'City' : 'CityName',
    'Clinic': 'ClinicName',
    'Client Name': 'ClientName',
    'Client Surname': 'ClientSurname',
    'Service': 'ServiceName',
    'Specialist': 'SpecialistTypeDescription'
}

const initQuery = () => {
    return `select ContractCode, C.CityName, C2.ClinicName, C3.ClientName, C3.ClientSurname, S.ServiceName, ST.SpecialistTypeDescription from Contract
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
    );

    const cityCode = await City.findOne({
        where: {
            cityName: city
        }
    }).then(v => v.cityCode);

    const clinicCode = await Clinic.findOne({
        where: {
            clinicName: clinic,
            cityCode: cityCode
        }
    }).then(v => v.clinicCode).catch(v => null);

    if (!clinicCode) {
        res.render('error', { message: 'where is no such clinic in this city' });
        return;
    }


    const serviceCode = await Service.findOne({ where: { serviceName: service } })
        .then(v => v.serviceCode);

    const specialistSplit = specialist.split(' ');

    const specialistCode =  await Specialist.findOne({
        where: { 
            specialistName: specialistSplit[1],
            specialistSurname: specialistSplit[2],
            specialistTypeDescription: specialistSplit[0],
            clinicCode: clinicCode
        }
    }).then(v => v.specialistCode).catch(v => null);;

    if (!specialistCode) {
        res.render('error', { message: 'where is no such specialist in this clinic' });
        return;
    }
    
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

router.post('/manage/city', async (req, res) => {
    const { table, cityName } = req.body;
    db.query(`insert into ${table} (CityName) values ('${cityName}')`, (err, results) => {
        if (err) res.render('error', { message: err.message });
        else {
            res.status(204).send();
        }
    });
});

router.post('/manage/clinic', async (req, res) => {
    const { table, clinicName, cityName } = req.body;
    const city = await City.findOne({
        where: {
            cityName: cityName
        }
    });
    db.query(`insert into ${table} (clinicName, cityCode) values ('${clinicName}', ${city.cityCode})`, (err, results) => {
        if (err) res.render('error', { message: err.message });
        else {
            res.status(204).send();
        }
    });
});

router.post('/manage/service', async (req, res) => {
    const { table, serviceName, servicePrice } = req.body;
    db.query(`insert into ${table} (ServiceName, ServicePrice) values ('${serviceName}', ${servicePrice})`, (err, results) => {
        if (err) res.render('error', { message: err.message });
        else {
            res.status(204).send();
        }
    });
});

router.post('/manage/specialist', async (req, res) => {
    const { table, specialistType, specialistName, specialistSurname, specialistClinic } = req.body;
    const clinic = await Clinic.findOne({
        where: {
            clinicName: specialistClinic
        }
    });
    
    db.query(`insert into ${table} (SpecialistTypeDescription, SpecialistName, SpecialistSurname, ClinicCode)
    values ('${specialistType}', '${specialistName}', '${specialistSurname}', '${clinic.clinicCode}')`, (err, results) => {
        if (err) res.render('error', { message: err.message });
        else {
            res.status(204).send();
        }
    });
});

router.get('/contract/:code', async (req, res) => {
    const { code } = req.params;

    db.query(`select * from Contract
    left join City C on Contract.CityCode = C.CityCode
    left join (select ClinicCode, ClinicName from Clinic group by ClinicCode, ClinicName) C2 on Contract.ClinicCode = C2.ClinicCode
    left join Client C3 on Contract.ClientCode = C3.ClientCode
    left join Service S on Contract.ServiceCode = S.ServiceCode
    left join SpecialistType ST on Contract.SpecialistCode = ST.SpecialistCode
    where ContractCode = ${code};`, (err, results) => {
        if (err) res.render('error', { message: err.message });
        else {
            res.render('contract', { result: results[0] });
        }
    });
});

router.get('/filter', async (req, res) => {
    const { field, value } = req.query;

    db.query(`select * from Contract
    left join City C on Contract.CityCode = C.CityCode
    left join (select ClinicCode, ClinicName from Clinic group by ClinicCode, ClinicName) C2 on Contract.ClinicCode = C2.ClinicCode
    left join Client C3 on Contract.ClientCode = C3.ClientCode
    left join Service S on Contract.ServiceCode = S.ServiceCode
    left join SpecialistType ST on Contract.SpecialistCode = ST.SpecialistCode
    where ${tableNameMap[field]} = '${value}';`, (err, results) => {
        if (err) res.render('error', { message: err.message });
        else {
            res.render('index', { result: results });
        }
    });
});


module.exports = router;