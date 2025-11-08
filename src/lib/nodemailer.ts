import nodemailer from "nodemailer";
import config from "../config/config";

const transport = nodemailer.createTransport({
    service : "gmail",
    auth : {
        user : config.appEmail,
        pass : config.appPassword,
    }
});

export default transport;