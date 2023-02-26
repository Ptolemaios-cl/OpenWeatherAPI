import express from 'express';
import axios from 'axios';
import nodemailer from 'nodemailer';
import { weatherData, createDatabase, insertRecords } from './database'
import config from '../config';
import { v4 as uuidv4 } from 'uuid';

const app = express();

const { email, weatherApiDetails } = config;

app.get('/', async (req, res) => {
	try {
		//Get Data from Openweather API
		const apiKey = weatherApiDetails.apiKey;
		const stkilda =  'Melbourne,StKilda';
		const redcliffe =  'Brisbane,Redcliffe';
		const urls = [
			`https://api.openweathermap.org/data/2.5/weather?q=${stkilda}&appid=${apiKey}&units=metric`,
			`https://api.openweathermap.org/data/2.5/weather?q=${redcliffe}&appid=${apiKey}&units=metric`,
		];

		//Get both requests as a promise in parallel
		const responses = await Promise.all(
			urls.map((url) => axios.get(url))
		);

		//Loop through the results from the promise and prepare an array with the Parsed data fields we need
		const weatherDataArray: weatherData[] = responses.map((response) => {
			return {
				id: uuidv4(),
				location: response.data.name,
				temperature: response.data.main.temp,
			};
		});
		  
		//Create database and Table if not created
		const db = await createDatabase();
		
		//Once database is created then we Insert records
		await insertRecords(db, weatherDataArray);	
		
		//Initialise nodemailer with Gmail Credentials
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: email.user,
				pass: email.password,
			}
		});

		//Create Email content with response data in HTML format
		const mailOptions = {
			from: email.user,
			to: email.emailTo,
			subject: 'Duress Code Example',
			html: `
				<p>Response:</p>
				<pre>Data has been collected and stored in the database</pre>
				`
		};

		//Send email and control error
		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.error(`Error sending email: ${error}`);
				res.status(500).send('Error sending email');
			} else {
				console.log(`Email sent: ${info.response}`);
				res.send('Email sent with API response');
			}
		});
		
	} catch (error) {
		console.error(`Error retrieving data: ${error}`);
		res.status(500).send('Error retrieving data');
	}
});

app.listen(3000, () => {
	console.log('Server started on port 3000');
});