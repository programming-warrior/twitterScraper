const express = require('express')
const { Builder, By, until } = require('selenium-webdriver');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');

const port = 3000


mongoose.connect(process.env.MONGO_URL).then(async() => {

    console.log('connected to the db');
    const Highlight = require('./model/highlights.js');
    const chrome = require('selenium-webdriver/chrome');


    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/index.html');
    })

    app.get('/run', async (request, response) => {
        try {
            const data = await scrapeTwitterHighlights();
            console.log(data);
            const newHighlight=new Highlight(data);

            const {_id}=await newHighlight.save();

            data['id']=_id.toString();
            return response.json(data);

        } catch (error) {
            response.status(500).json({
                message: 'Server error occurred',
            });
        }
    })


    app.get('/query/:id',async(req,res)=>{
        const id=req.params.id;
        if(!id){
            return res.status(401).json({message:"invalid id"});
        }

       const dbData=await Highlight.findOne({_id:id});


       const data={...dbData['_doc']};

       delete data['_id'];
       delete data['__v'];
       
       data['id']=id;

        return res.json(data);        
    })

    app.listen(port, () => {
        console.log(` app listening at http://localhost:${port}`)
    })




    async function scrapeTwitterHighlights() {

        let options = new chrome.Options();

        const res=await fetch('https://proxylist.geonode.com/api/proxy-list?protocols=http&limit=1&page=1&sort_by=lastChecked&sort_type=desc');
        const data=await res.json()


        const ip='us-ca.proxymesh.com:31280'

        const url=`http://${process.env.PROXYMESH_USERNAME}:${process.env.PROXYMESH_PASSWORD}@${ip}`;

        // options.addArguments(`--proxy-server=${url}`)

        let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();


        try {
            await driver.get('https://x.com/login');

            await driver.wait(until.elementLocated(By.name('text')), 20000);

            await driver.findElement(By.name('text')).sendKeys(`${process.env.TWITTER_USERNAME}`);


            await driver.findElement(By.css("button[type='button'][role='button'][style*='background-color: rgb(239, 243, 244);'] div span span:nth-child(1)")).click();


            await driver.wait(until.elementLocated(By.name('password')), 20000);

            await driver.findElement(By.name('password')).sendKeys(`${process.env.TWITTER_PASSWORD}`);

            await driver.findElement(By.css("button[data-testid='LoginForm_Login_Button']")).click();


            await driver.wait(until.elementLocated(By.css('div.css-175oi2r[aria-label="Timeline: Trending now"]')), 20000);


            await driver.wait(until.elementsLocated(By.css('#react-root > div > div > div.css-175oi2r.r-1f2l425.r-13qz1uu.r-417010.r-18u37iz > main > div > div > div > div.css-175oi2r.r-aqfbo4.r-1l8l4mf.r-1jocfgc > div > div.css-175oi2r.r-1jocfgc.r-gtdqiz > div > div > div > div:nth-child(4) > div > section > div > div > div'), 10000));



            const trends = await driver.findElements(By.css('#react-root > div > div > div.css-175oi2r.r-1f2l425.r-13qz1uu.r-417010.r-18u37iz > main > div > div > div > div.css-175oi2r.r-aqfbo4.r-1l8l4mf.r-1jocfgc > div > div.css-175oi2r.r-1jocfgc.r-gtdqiz > div > div > div > div:nth-child(4) > div > section > div > div > div > div > div > div >div:nth-child(2) > span'));


            let data = {}
            data['trends'] = [];

            for (const [i, trend] of trends.entries()) {
                try {
                    const innerSpan = await trend.findElement(By.css('span'));
                    data['trends'].push({ title: await innerSpan.getText() });
                }
                catch (e) {
                    data['trends'].push({ title: await trend.getText() });
                }
            }


            const { date, time } = getDateTime();

            data['date'] = `${date.year}-${date.month}-${date.day}`;

            data['time'] = `${time.hours}:${time.minutes}:${time.seconds}`;

            data['ip'] = ip;



            return data;

        } catch (error) {

            console.error('Error:', error);
        } finally {
            await driver.quit();
        }
    }


    function getDateTime() {
        const currentDate = new Date();
        const date = {};
        const time = {};

        date.year = currentDate.getFullYear();

        date.month = currentDate.getMonth() + 1;

        date.day = currentDate.getDate();

        time.hours = currentDate.getHours();

        time.minutes = currentDate.getMinutes();

        time.seconds = currentDate.getSeconds();

        return { date, time };
    }
})
