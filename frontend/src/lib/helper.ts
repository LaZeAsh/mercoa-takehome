import Airtable from 'airtable';

// Initialize Airtable
Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID as string);
const tableName = 'Table 1'; // Update this to match your actual table name

/**
 * Creates a user or authenticates an existing user
 * @param email User's email
 * @param password User's password
 * @returns User's email if authentication is successful, 'incorrect' otherwise
 */
export async function createUser(email: string, password: string): Promise<string> {
  try {
    // Check if user exists
    const records = await base(tableName).select({
      filterByFormula: `{email} = '${email}'`
    }).firstPage();

    console.log(records);
    
    if (records.length > 0) {
      // User exists, check password
      const user = records[0];
      const userPassword = user.get('password') as string;
      
      if (userPassword === password) {
        return email; // Correct password
      } else {
        return "incorrect"; // Incorrect password
      }
    } else {
      // User doesn't exist, create new user
      await base(tableName).create([
        {
          fields: {
            email,
            password
          }
        }
      ]);
      
      return email;
    }
  } catch (error) {
    console.error('Error in Airtable authentication:', error);
    return "incorrect";
  }
} 