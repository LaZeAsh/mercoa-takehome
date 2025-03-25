'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getInvoices, createInvoice, Invoice, CreateInvoiceParams } from '@/lib/api';

interface InvoiceExtended extends Invoice {
  amount: number;
  status: string;
  createdAt: string;
  vendorId: string;
  [key: string]: any;
}

export default function Invoices() {
  const [email, setEmail] = useState<string | null>(null);
  const [entityId, setEntityId] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<InvoiceExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [documentUrl, setDocumentUrl] = useState('');
  const [manualEntry, setManualEntry] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    amount: 100, // Default amount from backend
    dueDate: '',
    description: '',
    vendorName: '',
    invoiceNumber: ''
  });
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in and has an entity ID
    const userEmail = localStorage.getItem('userEmail');
    const storedEntityId = localStorage.getItem('entityId');
    
    if (!userEmail) {
      router.push('/login');
      return;
    }
    
    if (!storedEntityId) {
      router.push('/dashboard');
      return;
    }
    
    setEmail(userEmail);
    setEntityId(storedEntityId);
    
    // Fetch invoices
    fetchInvoices(storedEntityId);
  }, [router]);

  const fetchInvoices = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getInvoices(id);
      
      if (response.invoices && response.invoices.data) {
        setInvoices(response.invoices.data as InvoiceExtended[]);
      } else {
        setInvoices([]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch invoices. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value
    }));
  };

  const handleUploadInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!manualEntry && !documentUrl.trim()) {
      setMessage({
        text: 'Please enter a document URL or use manual entry',
        type: 'error'
      });
      return;
    }

    if (manualEntry && invoiceData.amount <= 0) {
      setMessage({
        text: 'Please enter a valid amount',
        type: 'error'
      });
      return;
    }
    
    setIsUploading(true);
    setMessage(null);
    
    try {
      if (!entityId) {
        throw new Error('Entity ID not found');
      }

      const params: CreateInvoiceParams = {
        entityId,
        amount: invoiceData.amount
        // The API currently only supports entityId and amount
      };
      
      const { invoiceId } = await createInvoice(params);
      
      if (invoiceId) {
        setMessage({
          text: `Invoice ${manualEntry ? 'created' : 'uploaded'} successfully! Invoice ID: ${invoiceId}`,
          type: 'success'
        });
        // Reset form
        setDocumentUrl('');
        setInvoiceData({
          amount: 100,
          dueDate: '',
          description: '',
          vendorName: '',
          invoiceNumber: ''
        });
        
        // Refresh invoice list
        await fetchInvoices(entityId);
      } else {
        setMessage({
          text: `Failed to ${manualEntry ? 'create' : 'upload'} invoice. Please try again.`,
          type: 'error'
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({
        text: 'An error occurred while processing the invoice',
        type: 'error'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('entityId');
    router.push('/login');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="mt-1 text-sm text-gray-500">
              {email} | Entity ID: {entityId}
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Log out
            </button>
          </div>
        </div>
        
        <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-6 text-xl font-semibold text-gray-800">
            {manualEntry ? 'Create New Invoice' : 'Upload New Invoice'}
          </h2>
          
          {message && (
            <div className={`mb-6 rounded-md p-4 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}
          
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setManualEntry(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${!manualEntry ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Upload Document
              </button>
              <button
                type="button"
                onClick={() => setManualEntry(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${manualEntry ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Manual Entry
              </button>
            </div>
          </div>
          
          <form onSubmit={handleUploadInvoice}>
            {!manualEntry ? (
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label htmlFor="documentUrl" className="block text-sm font-medium text-gray-700">
                    Document URL
                  </label>
                  <input
                    required
                    type="text"
                    id="documentUrl"
                    value={documentUrl}
                    onChange={(e) => setDocumentUrl(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 font-medium placeholder-gray-400"
                    placeholder="https://example.com/document.pdf"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300"
                >
                  {isUploading ? 'Uploading...' : 'Upload Invoice'}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                      Amount*
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="amount"
                        id="amount"
                        required
                        min="1"
                        step="0.01"
                        value={invoiceData.amount}
                        onChange={handleInvoiceDataChange}
                        className="block w-full rounded-md border border-gray-300 pl-7 pr-12 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 font-medium placeholder-gray-400"
                        placeholder="0.00"
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-500 sm:text-sm">USD</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700">
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      name="invoiceNumber"
                      id="invoiceNumber"
                      value={invoiceData.invoiceNumber}
                      onChange={handleInvoiceDataChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 font-medium placeholder-gray-400"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                      Due Date
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      id="dueDate"
                      value={invoiceData.dueDate}
                      onChange={handleInvoiceDataChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 font-medium placeholder-gray-400"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="vendorName" className="block text-sm font-medium text-gray-700">
                      Vendor Name
                    </label>
                    <input
                      type="text"
                      name="vendorName"
                      id="vendorName"
                      value={invoiceData.vendorName}
                      onChange={handleInvoiceDataChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 font-medium placeholder-gray-400"
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={3}
                      value={invoiceData.description}
                      onChange={handleInvoiceDataChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 font-medium placeholder-gray-400"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300"
                  >
                    {isUploading ? 'Creating...' : 'Create Invoice'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-6 text-xl font-semibold text-gray-800">Your Invoices</h2>
          
          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
          
          {invoices.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No invoices found. Upload your first invoice above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Invoice ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {invoice.id}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : invoice.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {formatDate(invoice.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 