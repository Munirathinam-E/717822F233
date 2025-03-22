import React, { Fragment, useState } from 'react';
import { Container, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const AverageCal = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [type, setType] = useState('fibo');
  const [details, setDetails] = useState({
    windowPrevState: [],
    windowCurrState: [],
    numbers: [],
    avg: 0,
  });

  const fetchWithTimeout = (url, timeout = 2000) => {
    return Promise.race([
      fetch(url).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch data from ${url}`);
        return res.json();
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error(`Request to ${url} timed out`)), timeout)),
    ]);
  };

  const apiFetch = async (selectedType) => {
    try {
      const url = `http://20.244.56.144/test/${selectedType}`;
      console.log('Fetching from:', url);
      const result = await fetchWithTimeout(url);
      console.log('API Response:', result);

      const newNumbers = result.numbers.filter((n) => !details.windowCurrState.includes(n));
      let updatedWindow = [...details.windowCurrState, ...newNumbers];

      if (updatedWindow.length > 10) {
        const overflow = updatedWindow.length - 10;
        updatedWindow = updatedWindow.slice(overflow);
      }

      setDetails({
        windowPrevState: details.windowCurrState,
        windowCurrState: updatedWindow,
        numbers: result.numbers,
        avg: updatedWindow.length ? (updatedWindow.reduce((a, b) => a + b, 0) / updatedWindow.length).toFixed(2) : 0,
      });

      setData(result);
      setError(null);
    } catch (err) {
      console.error('Error:', err.message);
      setError(err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    apiFetch(type);
  };

  return (
    <Fragment>
      <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-200 flex items-center justify-center p-4">
        <Container className="bg-white shadow-xl rounded-2xl p-8 max-w-4xl w-full">
          <h1 className="text-3xl font-bold mb-8 text-center text-indigo-600">Average Calculator Microservice</h1>

          <Form onSubmit={handleSubmit} className="space-y-6">
            <FormGroup>
              <Label for="numberType" className="block text-lg font-medium text-gray-700">Select Number Type</Label>
              <Input
                type="select"
                id="numberType"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="primes">Prime Numbers</option>
                <option value="fibo">Fibonacci Numbers</option>
                <option value="even">Even Numbers</option>
                <option value="rand">Random Numbers</option>
              </Input>
            </FormGroup>

            <Button color="primary" type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg shadow-md">
              Submit
            </Button>
          </Form>

          {error && <p className="text-red-600 mt-4">Error: {error}</p>}

          {data && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">API Response</h2>
              <pre className="bg-gray-100 p-4 rounded-lg shadow-inner overflow-auto">{JSON.stringify(data, null, 2)}</pre>

              <h2 className="text-2xl font-semibold mt-6 mb-4 text-gray-800">Details</h2>
              <pre className="bg-gray-100 p-4 rounded-lg shadow-inner overflow-auto">{JSON.stringify(details, null, 2)}</pre>
            </div>
          )}
        </Container>
      </div>
    </Fragment>
  );
};

export default AverageCal;
