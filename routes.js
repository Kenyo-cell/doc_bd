const express = require('express');
const path = require('path');
const mysql = require("mysql2");

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
    left join Services S on Contract.ServiceCode = S.ServiceCode
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

router.get('/add', (req, res) => {
    let result = { 
        cities: "",
        clinics: "",
        specialists: "",
        services: ""
    };
    db.query(`select CityName from City;`, (err, results) => {
        if (err) console.log(err.message);
        else result.cities = results
    });
    db.query(`select ClinicName from Clinic;`, (err, results) => {
        if (err) console.log(err.message);
        else result.clinics = results
    });
    db.query(`select SpecialistTypeDescription from SpecialistType;`, (err, results) => {
        if (err) console.log(err.message);
        else result.specialists = results
    });
    db.query(`select ServiceName from Services;`, (err, results) => {
        if (err) console.log(err.message);
        else result.services = results
    });
    console.log(result);
    res.render('add', {
        cities: result.cities,
        clinics: result.clinics,
        specialists: result.specialists,
        services: result.services
    });
});


module.exports = router;