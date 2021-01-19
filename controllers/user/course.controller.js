const express = require('express');
const route = express.Router();
const path = require('path');
const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;


const db = require('../../utils/db');
const mongoose=require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const bodyParser = require('body-parser');
const Admin = require('../../models/schema/Admin.model');
const KhoaHoc = require('../../models/schema/KhoaHoc.model');
const GiangVien = require('../../models/schema/GiangVien.model');
const HocVien = require('../../models/schema/HocVien.model');
const TheLoaiCap1 = require('../../models/schema/TheLoaiCap1.model');
const TheLoaiCap2  =require('../../models/schema/TheLoaiCap2.model');
const DanhGia = require('../../models/schema/DanhGia.model');
const Chuong = require('../../models/schema/Chuong.model');

route.get('/', async (req, res) => {
    console.log("go to course");

});
route.get('/:courseid', async (req,res)=>{

    req.isAuthenticated();
    const _id =  req.user._id ;
    const courseID = req.params.courseid;
    db._connect(); 
    const course = await KhoaHoc.findById(courseID).lean();
    const userinfo = await HocVien.findOne({ "_id": _id}).lean();
    const teacher = await GiangVien.findOne({"_id":course.GiangVien}).lean();
    let myCmt = await DanhGia.findOne({"idKhoaHoc":courseID,"idHocVien":_id}).lean();
    const cmt = await DanhGia.find({"idKhoaHoc":courseID}).lean();

    for ( i in cmt){
        let TacGia = await HocVien.findOne({"_id":cmt[i].idHocVien}).select('Ten -_id').lean();
        cmt[i].TacGia = TacGia;
        };
    const theloai2 = await TheLoaiCap2.findOne({"_id":course.TheLoai2}).lean();
    const ListChuong = await Chuong.find({"beLongTo":courseID}).lean();


    res.render('user/courseDetail',{
        title: "Lectureslist",
        layout: 'user/course',
        course :course,
        userinfo: userinfo,
        teacher: teacher,
        DanhGia: cmt,
        TheLoai2: theloai2,
        MyCmt: myCmt,
        chuong: ListChuong,
        isAuthentication: req.isAuthenticated()
    })
    db._disconnect();
});

module.exports = route;