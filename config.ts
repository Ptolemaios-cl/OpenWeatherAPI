import dotenv from 'dotenv';

dotenv.config();

interface Config {
    email: {
        user: string;
        password: string;
        emailTo: string;
    };
    weatherApiDetails: {
        apiKey: string;
    }
}
  
const config: Config = {
    email: {
        user: process.env.EMAIL_USER || 'my@gmail.com',
        password: process.env.EMAIL_PASS || 'mypassword',
        emailTo: process.env.EMAIL_TO || 'my_email_to@gmail.com'
    },
    weatherApiDetails: {
        apiKey: process.env.OWAPI || 'myapikey'
    }
};
  
export default config;