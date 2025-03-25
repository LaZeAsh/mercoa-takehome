'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { findEntity, createBusinessEntity, BusinessEntityParams } from '@/lib/api';

export default function Dashboard() {
  const [email, setEmail] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    legalBusinessName: '',
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateOrProvince: '',
    postalCode: '',
    country: 'US',
    phoneNumber: '',
    phoneCountryCode: '1',
    day: '',
    month: '',
    year: '',
    ssn: '',
    jobTitle: '',
    isController: false,
    isOwner: false,
    ownershipPercentage: 0,
    ein: '',
    description: ''
  });

  useEffect(() => {
    // Check if user is logged in
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      router.push('/login');
    } else {
      setEmail(userEmail);
      
      // Check if an entity already exists for this user
      checkExistingEntity(userEmail);
    }
  }, [router]);

  // Function to check if an entity already exists
  const checkExistingEntity = async (userEmail: string) => {
    try {
      // Check if a business entity exists
      const { entityId } = await findEntity(userEmail);
      
      if (entityId && entityId !== "UNDEFINED") {
        // Business entity exists - store the ID and redirect to invoices
        localStorage.setItem('entityId', entityId);
        router.push('/invoices');
      }
      // If no business entity exists, the form will be shown for creating a new one
    } catch (err) {
      console.error('Error checking for existing entity:', err);
      // Just show the form if there's an error checking
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    router.push('/login');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const requestBody: BusinessEntityParams = {
        email: email as string,
        legalBusinessName: formData.legalBusinessName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        addressLine1: formData.addressLine1,
        city: formData.city,
        stateOrProvince: formData.stateOrProvince,
        postalCode: formData.postalCode,
        phoneNumber: formData.phoneNumber,
        // Optional fields
        middleName: formData.middleName || undefined,
        suffix: formData.suffix || undefined,
        addressLine2: formData.addressLine2 || undefined,
        country: formData.country || undefined,
        phoneCountryCode: formData.phoneCountryCode || undefined,
        day: formData.day ? parseInt(formData.day) : undefined,
        month: formData.month ? parseInt(formData.month) : undefined,
        year: formData.year ? parseInt(formData.year) : undefined,
        ssn: formData.ssn || undefined,
        jobTitle: formData.jobTitle || undefined,
        isController: formData.isController,
        isOwner: formData.isOwner,
        ownershipPercentage: formData.ownershipPercentage,
        ein: formData.ein || undefined,
        description: formData.description || undefined
      };

      const { entityId } = await createBusinessEntity(requestBody);

      if (entityId === "UNDEFINED") {
        setMessage({
          text: 'Business name is required',
          type: 'error'
        });
      } else {
        setMessage({
          text: `Business entity created successfully! Entity ID: ${entityId}`,
          type: 'success'
        });
        
        // Store the entity ID in localStorage
        localStorage.setItem('entityId', entityId);
        
        // Redirect to invoices page after a short delay to show success message
        setTimeout(() => {
          router.push('/invoices');
        }, 1500);
        
        // Reset form after successful submission
        setFormData({
          legalBusinessName: '',
          firstName: '',
          middleName: '',
          lastName: '',
          suffix: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          stateOrProvince: '',
          postalCode: '',
          country: 'US',
          phoneNumber: '',
          phoneCountryCode: '1',
          day: '',
          month: '',
          year: '',
          ssn: '',
          jobTitle: '',
          isController: false,
          isOwner: false,
          ownershipPercentage: 0,
          ein: '',
          description: ''
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({
        text: 'An error occurred while submitting the form',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!email) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Log out
          </button>
        </div>
        
        <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Welcome!</h2>
          <p className="text-gray-600">
            You are logged in as: <span className="font-medium">{email}</span>
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-6 text-xl font-semibold text-gray-800">Business Information</h2>
          
          {message && (
            <div className={`mb-6 rounded-md p-4 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h3 className="mb-4 text-lg font-medium text-gray-700">Business Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="col-span-2">
                  <label htmlFor="legalBusinessName" className="block text-sm font-medium text-gray-700">
                    Legal Business Name*
                  </label>
                  <input
                    required
                    type="text"
                    id="legalBusinessName"
                    name="legalBusinessName"
                    value={formData.legalBusinessName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 font-medium placeholder-gray-400"
                  />
                </div>
                
                <div className="col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Business Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 font-medium placeholder-gray-400"
                  />
                </div>

                <div>
                  <label htmlFor="ein" className="block text-sm font-medium text-gray-700">
                    EIN (Tax ID)
                  </label>
                  <input
                    type="text"
                    id="ein"
                    name="ein"
                    value={formData.ein}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 font-medium placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="mb-4 text-lg font-medium text-gray-700">Business Address</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="col-span-2">
                  <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">
                    Address Line 1*
                  </label>
                  <input
                    required
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 font-medium placeholder-gray-400"
                  />
                </div>
                
                <div className="col-span-2">
                  <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    id="addressLine2"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 font-medium placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City*
                  </label>
                  <input
                    required
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 font-medium placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label htmlFor="stateOrProvince" className="block text-sm font-medium text-gray-700">
                    State/Province*
                  </label>
                  <input
                    required
                    type="text"
                    id="stateOrProvince"
                    name="stateOrProvince"
                    value={formData.stateOrProvince}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 font-medium placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                    Postal Code*
                  </label>
                  <input
                    required
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 font-medium placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 font-medium placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="mb-4 text-lg font-medium text-gray-700">Contact Information</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="phoneCountryCode" className="block text-sm font-medium text-gray-700">
                    Country Code
                  </label>
                  <input
                    type="text"
                    id="phoneCountryCode"
                    name="phoneCountryCode"
                    value={formData.phoneCountryCode}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 font-medium placeholder-gray-400"
                  />
                </div>
                
                <div className="col-span-2">
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Phone Number*
                  </label>
                  <input
                    required
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 font-medium placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="mb-4 text-lg font-medium text-gray-700">Representative Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name*
                  </label>
                  <input
                    required
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 font-medium placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label htmlFor="middleName" className="block text-sm font-medium text-gray-700">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    id="middleName"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 font-medium placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name*
                  </label>
                  <input
                    required
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 font-medium placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label htmlFor="suffix" className="block text-sm font-medium text-gray-700">
                    Suffix
                  </label>
                  <input
                    type="text"
                    id="suffix"
                    name="suffix"
                    value={formData.suffix}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 font-medium placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label htmlFor="month" className="block text-sm font-medium text-gray-700">
                    Birth Month
                  </label>
                  <input
                    type="number"
                    id="month"
                    name="month"
                    min="1"
                    max="12"
                    value={formData.month}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 font-medium placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label htmlFor="day" className="block text-sm font-medium text-gray-700">
                    Birth Day
                  </label>
                  <input
                    type="number"
                    id="day"
                    name="day"
                    min="1"
                    max="31"
                    value={formData.day}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 font-medium placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                    Birth Year
                  </label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    min="1900"
                    max="2023"
                    value={formData.year}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 font-medium placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label htmlFor="ssn" className="block text-sm font-medium text-gray-700">
                    SSN
                  </label>
                  <input
                    type="text"
                    id="ssn"
                    name="ssn"
                    value={formData.ssn}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 font-medium placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
                    Job Title
                  </label>
                  <input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 font-medium placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label htmlFor="ownershipPercentage" className="block text-sm font-medium text-gray-700">
                    Ownership Percentage
                  </label>
                  <input
                    type="number"
                    id="ownershipPercentage"
                    name="ownershipPercentage"
                    value={formData.ownershipPercentage}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 font-medium placeholder-gray-400"
                  />
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isController"
                      name="isController"
                      checked={formData.isController}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="isController" className="ml-2 block text-sm text-gray-700">
                      Is Controller
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isOwner"
                      name="isOwner"
                      checked={formData.isOwner}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="isOwner" className="ml-2 block text-sm text-gray-700">
                      Is Owner
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Business Information'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 