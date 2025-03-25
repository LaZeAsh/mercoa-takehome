import express from 'express';
import { Mercoa, MercoaClient } from '@mercoa/javascript';
import dotenv from 'dotenv';
import { createUser } from './helper';
import cors from 'cors';

dotenv.config();
const app = express();
const client = new MercoaClient({ token: process.env.MERCOA_KEY as string })

// Enable CORS for all routes
app.use(cors());
app.use(express.json())

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const response = createUser(email, password);

  if(response === "incorrect") {
    res.send({"email": "incorrect"}); // Incorrect password
  } else {
    res.send({"email": email}); // Correct password
  }
});

app.get('/customer_entity', async(req, res) => {
  const email: string = req.body.email as string;
  const fullName: Mercoa.FullName = {
    firstName: req.body.firstName as string,
    middleName: req.body.middleName,
    lastName: req.body.lastName as string,
    suffix: req.body.suffix
  };

  const existingUser: Mercoa.FindEntityResponse = await client.entity.find({
    isCustomer: true,
    search: email
  });

  if(existingUser.count > 0) {
    res.send({ "entityId": existingUser.data[0].id });
  } else {
    const user = await client.entity.create({
      isCustomer: true,
      isPayor: true,
      isPayee: false,
      accountType: "individual",
      profile: {
        individual: {
          name: fullName
        }
      }
    });
    res.send({ "entityId": user.id });
  }
});

app.post('/find_entity', async(req, res) => {
  const email: string = req.body.email as string;

  const existingEntity: Mercoa.FindEntityResponse = await client.entity.find({
    isCustomer: false,
    search: email
  }); 

  if(existingEntity.count > 0) {
    res.send({ "entityId": existingEntity.data[0].id });
  } else {
    res.send({ "entityId": "UNDEFINED" });
  }
});

app.post('/business_entity', async(req, res) => {
  const email: string = req.body.email as string;
  
  const legalBusinessName: string | undefined = req.body.legalBusinessName;
  const fullName: Mercoa.FullName = {
    firstName: req.body.firstName as string,
    middleName: req.body.middleName,
    lastName: req.body.lastName as string,
    suffix: req.body.suffix
  };

  const address: Mercoa.Address = {
    addressLine1: req.body.addressLine1 as string,
    city: req.body.city as string,
    stateOrProvince: req.body.stateOrProvince as string,
    postalCode: req.body.postalCode as string,
    addressLine2: req.body.addressLine2,
    country: req.body.country
  };

  const phone: Mercoa.PhoneNumber = {
    number: req.body.phoneNumber as string,
    countryCode: req.body.phoneCountryCode || '1'
  };

  const birthDate: Mercoa.BirthDate = {
    day: req.body.day,
    month: req.body.month,
    year: req.body.year 
  };

  const govId: Mercoa.IndividualGovernmentId = {
    ssn: req.body.ssn
  };

  const responsibilities: Mercoa.Responsibilities = {
    jobTitle: req.body.jobTitle,
    isController: req.body.isController,
    isOwner: req.body.isOwner,
    ownershipPercentage: req.body.ownershipPercentage
  };

  const taxId: Mercoa.TaxId = {
    ein: {
      number: req.body.ein
    }
  };

  // legalBusinessName is required
  if(typeof legalBusinessName === undefined) {
    res.send({ "entityId": "UNDEFINED" }); // Need legal business name to create an entity id
  };

  const entity: Mercoa.EntityResponse = await client.entity.create({
    isCustomer: false,
    isPayor: false,
    isPayee: true,
    accountType: "business",
      // The take-home only entails a business
    profile: {
      business: {
        legalBusinessName: legalBusinessName as string, 
        email: email,
        address: address,
        phone: phone,
        description: req.body.description,
        taxId: taxId
      }
    }
  });

  await client.entity.acceptTermsOfService(entity.id); // Accept TOS
  await client.entity.representative.create(entity.id, {
    name: fullName,
    address: address,
    email: email,
    birthDate: birthDate,
    governmentId: govId,
    responsibilities: responsibilities
  });
  await client.entity.initiateKyb(entity.id); // Initiate KYB

  res.send({ "entityId": entity.id });
});


app.post('/get_invoice', async(req, res) => {
  const entityId: Mercoa.EntityId = req.body.entityId;
  const invoices = await client.entity.invoice.find(entityId, {
    limit: 100
  });

  res.send({ "invoices": invoices });
});



app.post('/invoice', async(req, res) => {
  const entityId = req.body.entityId as string;
  console.log(entityId);
  const invoice = await client.invoice.create({
    // status: "NEW",
    creatorEntityId: entityId,
    payerId: entityId,
    amount: req.body.amount as number,
    // document: req.body.document,
    // creatorEntityGroupId: ""
  });

  res.send({ "invoiceId": invoice.id });
});


app.listen(3001, () => {
  console.log("Server is running on port 3001");
});

