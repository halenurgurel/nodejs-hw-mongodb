import nodemailer from 'nodemailer';
import { env } from './env.js';

//runs once when the app starts. it creates a reusable transporter object
const transporter = nodemailer.createTransport({
  host: env('SMTP_HOST'),
  port: env('SMTP_PORT'),
  auth: {
    user: env('SMTP_USER'),
    pass: env('SMTP_PASSWORD'),
  },
});

//function we call it in sercice to send an email
export const sendMail = async (options) => {
  return await transporter.sendMail(options);
};
