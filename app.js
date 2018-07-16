let express = require("express");

let svgCaptcha = require("svg-captcha");

let path = require("path");

let session =  require('express-session');

let app = express();

// 添加body-parser模块,格式化表单数据
let bodyParser = require("body-parser");

// 导入mongoDB 
const MongoClient = require('mongodb').MongoClient;
// mongoDB 需要使用到的 配置
// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'SZHM19';


// 设置静态资源托管
app.use(express.static('static'));

app.use(session({
    secret: 'keyboard cat'
  }))

// 使用body-parser中间件
app.use(bodyParser.urlencoded({ extended: false }));

// 路由1
// 使用GET方法，访问登录页面时，直接读取页面，并返回
app.get('/login',(req,res)=>{
    // 直接读取文件并返回
    res.sendFile(path.join(__dirname,"static/views/login.html"));
})

// 路由2 
// 使用post方法 提交数据过来 验证用户登录
app.post('/login',(req,res)=>{
    // console.log(req);
    // 保存变量
    let userName = req.body.userName;
    let userPass = req.body.userPass;
    let code = req.body.code;

    // 判断验证码是否正确
    if(code == req.session.captcha){
        // console.log("验证码正确");
        req.session.userInfo = {
            userName,
            userPass
        }

        res.redirect("/index");
    }else{
        // console.log("验证码错误");
        // 如果验证码错误 就返回登录页
        res.setHeader("content-type","text/html");
        res.send("<script>alert('验证码错误');window.location.href='/login'</script>");
    }

    // res.send("/login")
})

// 路由3
// 生成图片的功能
// 把这个地址 设置给 登录页的图片的src属性
app.get('/login/captchImg',(req,res)=>{
    var captcha = svgCaptcha.create();
    req.session.captcha = captcha.text.toLocaleLowerCase();
    console.log(captcha.text);
	
	res.type('svg'); // 使用ejs等模板时如果报错 res.type('html')
	res.status(200).send(captcha.data);
})

// 路由4
// 访问首页  index
app.get("/index",(req,res)=>{
    if(req.session.userInfo){
        // 说明登录了
        res.sendFile(path.join(__dirname,"static/views/index.html"));
    }else{
        // 说明密码错误 打回登录页
        res.setHeader("content-type","text/html");
        res.send("<script>alert('请登录');window.location.href='/login'</script>");
    }
})

// 路由5
// 登出操作  删除session
app.get("/logout",(req,res)=>{
    delete req.session.userInfo;

    res.redirect('/login');
})

// 路由6
// 点击注册页   跳转注册页面
app.get('/register',(req,res)=>{
    res.sendFile(path.join(__dirname,"static/views/register.html"));
})

// 路由7
app.post('/register', (req, res) => {
    
        // 获取用户数据
        let userName = req.body.userName;
        let userPass = req.body.userPass;
        console.log(userName);
        console.log(userPass);
    
        MongoClient.connect(url,  (err, client)=>{
            // 连上mongo之后 选择使用的库
            const db = client.db(dbName);
            // 选择使用的集合
            let collection = db.collection('userList');
    
            // 查询数据
            collection.find({
                userName
            }).toArray((err,doc)=>{
                console.log(doc);
                if(doc.length==0){
                    // 没有人
                    // 新增数据
                    collection.insertOne({
                        userName,
                        userPass
                    },(err,result)=>{
                        console.log(err);
                        // 注册成功了
                        res.setHeader('content-type','text/html');
                        res.send("<script>alert('欢迎入坑');window.location='/login'</script>")
                        // 关闭数据库连接即可
                        client.close();
                    })
                }
            })
            
        });
    })

app.listen(8848,"127.0.0.1",()=>{
    console.log("开始监听");
})