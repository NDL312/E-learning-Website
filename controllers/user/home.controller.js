const  express = require('express');
const route = express.Router();
const db = require('../../utils/db');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Admin = require('../../models/schema/Admin.model');
const KhoaHoc = require('../../models/schema/KhoaHoc.model');
const GiangVien = require('../../models/schema/GiangVien.model');
const HocVien = require('../../models/schema/HocVien.model');
const TheLoaiCap1 = require('../../models/schema/TheLoaiCap1.model');
const TheLoaiCap2  =require('../../models/schema/TheLoaiCap2.model');
const ThongKe = require('../../models/schema/ThongKe.model');

route.get('/', async (req,res )=>{
  console.log('go to home');
  db._connect();
 
  const trending = await KhoaHoc.findOne().sort({DiemDanhGia:-1}).limit(1).lean();
  const mostView = await KhoaHoc.findOne().sort({SoLuotXem:-1}).limit(1).lean();
  const newest = await KhoaHoc.findOne().sort({NgayDang:-1}).limit(1).lean();
  res.render('user/home', {
    layout: 'main',
    trending: trending,
    mostView: mostView,
    newest: newest
  });
  // console.log(trending);
  // console.log(mostView);
  // console.log(newest);
});

module.exports = route;