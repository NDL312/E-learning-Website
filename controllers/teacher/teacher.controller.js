const  express = require('express');
const route = express.Router();
const db = require('../../utils/db');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const bodyParser = require('body-parser');
const Admin = require('../../models/schema/Admin.model');
const KhoaHoc = require('../../models/schema/KhoaHoc.model');
const GiangVien = require('../../models/schema/GiangVien.model');
const HocVien = require('../../models/schema/HocVien.model');
const TheLoaiCap1 = require('../../models/schema/TheLoaiCap1.model');
const TheLoaiCap2  =require('../../models/schema/TheLoaiCap2.model');
const ThongKe = require('../../models/schema/ThongKe.model');
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");

const upload = require("../../middleware/upload");


// const crudTheLoai = require('./crudTheLoai');
// const crudKhoaHoc = require('./crudKhoaHoc');
// const crudGiangVien = require('./crudGiangVien');
// const crudHocVien = require('./crudHocVien');
// const crudThongKe = require('./crudThongKe');
const bcrypt = require('bcrypt');


route.get('/', async (req,res )=>{
  const _id = req.user._id;
  db._connect();
  const user = await GiangVien.findById(_id).lean();
  db._disconnect();
  console.log('go to teacher');
  console.log('user :>> ', user);
  res.render('teacher/dashboard',{
    layout:'teacher/t_main',
    title : '',
    user : user
  });
});

route.get('/profile', async (req,res )=>{
  const _id = req.user._id;
  db._connect();
  const user = await GiangVien.findById(_id).lean();
  db._disconnect();
  console.log('go to teacher profile');
  console.log('user :>> ', user);
  res.render('teacher/teacher_profile',{
    layout:'teacher/t_main',
    title : 'Profile',
    user : user
  });
});


route.get('/createCourse', async (req,res)=>{
  console.log('tạo khóa học');
  const _id = req.user._id;
  db._connect();
  const user = await GiangVien.findById(_id);
  const data = await TheLoaiCap1.find().populate('TheLoaiCon').lean();
  db._disconnect();
  var theloai = [];
  data.forEach(element => {
    theloai = theloai.concat(element.TheLoaiCon);
  });
  res.render( 'teacher/createcourse' ,{
    layout:'teacher/t_main',
    title : 'Create course',
    theloai : theloai,
    user : user
  })
  
});

route.post('/addCourse', async (req,res)=>{
  console.log('get add course');
  const user = req.user;
  //console.log('user :>> ', user);
  db._connect();
  var file;
  //img
    upload(req, res, async function(error){
      if (error) {
        console.log(error);
        return res.send(`Error when trying upload image: ${error}`);
      }
      else{
        const {tenkhoahoc, _idTheLoai, hocphi, khuyenmai, motangan, motachitiet} = req.body;
        // console.log('rqe.file', req.file);
        //   console.log('tenkhoahoc :>> ', tenkhoahoc);
        //     console.log('_idTheLoai :>> ', _idTheLoai);
        //     console.log('motangan :>> ', motangan);
        //     console.log('khuyenmai :>> ', khuyenmai);
        //     console.log('motachitiet :>> ', motachitiet);
        // console.log('req.body b=nene  :>> ', req.body);
        if (req.file == undefined) {
          return res.send(`You must select a file.`); ;
        }
        console.log(`File has been uploaded.`);
        file = req.file;  
        const khoahoc = new KhoaHoc({ 
            TenKhoaHoc : tenkhoahoc,
            TheLoaiCap2 : mongoose.Types.ObjectId(_idTheLoai),
            GiangVien : mongoose.Types.ObjectId(user._id),
            HocPhiGoc : hocphi,
            KhuyenMai : khuyenmai,
            MoTaNgan : motangan,
            MoTaChiTiet : motachitiet,
            TrangThai : 1,
            AnhDaiDien: mongoose.Types.ObjectId(file.id),
            DSHocVien : [],
            DeCuong : [],
            DiemDanhGia: 0,
            LuoiXem : 0
          });
          //luu khoa hoc
          await khoahoc.save();
          console.log('save Khoa hoc');
          console.log('khoahoc._id :>> ', khoahoc._id);
          await GiangVien.findByIdAndUpdate(user._id, {$push:{DSKhoaHocDay:khoahoc._id}} );
          console.log('save khoa hoc to giang vien');
          db._disconnect();
          res.redirect('./')
      }
    });

});

route.get('/mycourses', async (req,res)=>{
  console.log('tds khoa hoc giang vien');
  const _id = req.user._id;
  db._connect();
  const user = await GiangVien.findById(_id).populate('DSKhoaHocDay').lean();
  console.log('user :>> ', user);
  db._disconnect();
  // var theloai = [];
  // data.forEach(element => {
  //   theloai = theloai.concat(element.TheLoaiCon);
  // });
  res.render( 'teacher/mycourses' ,{
    layout:'teacher/t_main',
    title : 'My courses',
    user : user,  
  })
  
});


route.post('/changeinfo', async (req,res)=>{
  console.log('change');
  if (!req.isAuthenticated()){
      
      res.redirect('/Login/');
      return; 
  }
  const _id = req.user._id;
  const { ten, mail} = req.body;
  db._connect(); 
  const gv = await GiangVien.findById(_id);
  console.log('gv :>> ', gv);
  db._connect();
  GiangVien.findByIdAndUpdate(_id,{Ten:ten, Mail:mail},function (err,doc) {
    if (err) return console.error(err);
    db._disconnect;
    res.redirect(`./profile`);
  });

});

route.get("/changepw", async (req,res)=>{ 
  if (!req.isAuthenticated()){
      res.redirect('/login');
      return; 
  }
  const _id =  req.user._id ;
  db._connect(); 
  var user = await GiangVien.findById(_id).lean();
  res.render('teacher/changepw',{
      title:"Change Password" ,
      layout : 'teacher/t_main',
      user : user,
      isAuthentication: req.isAuthenticated()
  });
  db._disconnect();
});

route.post("/postchangepw2", async (req, res) => {
  db._connect(); 
  var ID = req.query.id;  
  var curpw = req.query.curpw;
  var newpw  = req.query.newpw;
  var user = await GiangVien.findById(ID);
  if(!comparePassword(curpw,user.Password)){
      res.send('incorrect');
      return;
  }else{console.log("dung");}
  var changepw = await GiangVien.findByIdAndUpdate(ID,{Password:hashPassword(newpw)},function(err){
      if(err){
          console.log('Err: ', err);
          res.send('failed');
      }
      else{
          res.send('successed');
      }
  });
  db._disconnect();
}
);

route.get('/logout', (req, res) => {
  console.log('log out teacjer');
  req.logout();
  res.redirect('/createCourse');
});


const hashPassword = (myPassword) => {
  const SALT_HASH = 10;
  const hash = bcrypt.hashSync(myPassword, SALT_HASH);
  return hash;
}

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/Login/');
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
}
const comparePassword = (myPassword, hash) => {
  return bcrypt.compareSync(myPassword, hash);
};

module.exports = route;
