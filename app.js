let express = require("express");

let svgCaptcha = require("svg-captcha");

let path = require("path");

let app = express();

// 设置静态资源托管
app.use(express.static('static'));

// 路由1
// 使用GET方法，访问登录页面时，直接读取页面，并返回
app.get('/login',(req,res)=>{
    // 直接读取文件并返回
    res.sendFile(path.join(__dirname,"static/views/login.html"));
})

// 路由2
// 生成图片的功能
// 把这个地址 设置给 登录页的图片的src属性
app.get('/login/captchImg',(req,res)=>{
    var captcha = svgCaptcha.create();
    // req.session.captcha = captcha.text;
    console.log(captcha.text);
	
	res.type('svg'); // 使用ejs等模板时如果报错 res.type('html')
	res.status(200).send(captcha.data);
})

app.listen(8848,"127.0.0.1",()=>{
    console.log("开始监听");
})