import { Mercoa, MercoaClient } from '@mercoa/javascript';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import json_schema from '../@types/login';

config();

const dbPath = path.join(__dirname, '..', 'db.json');
const db: json_schema = JSON.parse(fs.readFileSync(dbPath, 'utf8'));


function createUser(email: string, password: string): string {
  const output = checkIfUserExists(email, password);
  if(output === "email") {
    return "incorrect";
  } else if(output === "password") {
    return email;
  };

  db.data.push({
    email: email, 
    password: password
  });
  fs.writeFileSync(dbPath, JSON.stringify(db));

  return email;
}

function checkIfUserExists(email: string, password: string): string {
  let exists = "none";
  db.data.forEach((val) => {
    if(val.email === email) {
      exists = "email";
      if(val.password === password) {
        exists = "password";
      }
      return exists;
    };
  });

  return exists;
}

export { createUser };
