import { NextRequest, NextResponse } from 'next/server';
import { Mercoa, MercoaClient } from '@mercoa/javascript';

// Mock Mercoa client
const client = new MercoaClient({ token: process.env.MERCOA_KEY || 'mock_key' });

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const email: string = body.email as string;
  const legalBusinessName: string | undefined = body.legalBusinessName;
  const fullName: Mercoa.FullName = {
    firstName: body.firstName as string,
    middleName: body.middleName,
    lastName: body.lastName as string,
    suffix: body.suffix
  };

  const address: Mercoa.Address = {
    addressLine1: body.addressLine1 as string,
    city: body.city as string,
    stateOrProvince: body.stateOrProvince as string,
    postalCode: body.postalCode as string,
    addressLine2: body.addressLine2,
    country: body.country
  };

  const phone: Mercoa.PhoneNumber = {
    number: body.phoneNumber as string,
    countryCode: body.phoneCountryCode || '1'
  };

  const birthDate: Mercoa.BirthDate = {
    day: body.day,
    month: body.month,
    year: body.year 
  };

  const govId: Mercoa.IndividualGovernmentId = {
    ssn: body.ssn
  };

  const responsibilities: Mercoa.Responsibilities = {
    jobTitle: body.jobTitle,
    isController: body.isController,
    isOwner: body.isOwner,
    ownershipPercentage: body.ownershipPercentage
  };

  const taxId: Mercoa.TaxId = {
    ein: {
      number: body.ein
    }
  };

  // legalBusinessName is required
  if(typeof legalBusinessName === undefined) {
    return NextResponse.json({ entityId: "UNDEFINED" }); // Need legal business name to create an entity id
  };

  try {
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
          description: body.description,
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

    return NextResponse.json({ entityId: entity.id });
  } catch (error) {
    console.error('Error creating business entity:', error);
    return NextResponse.json({ entityId: "UNDEFINED", error: 'Failed to create business entity' });
  }
} 