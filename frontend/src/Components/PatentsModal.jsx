import React, { useState, useEffect } from 'react';
import '../CustomStyles/scrollbar.css';
import '../CustomStyles/modal.css';
import PatentsEntry from './PatentsEntry';
import { getPatentMatches, addUserCVData } from '../graphql/graphqlHelpers';

const PatentsModal = ({ user, section, onClose, setRetrievingData, fetchData }) => {
  const [allPatentsData, setAllPatentsData] = useState([]);
  const [selectedPatentsData, setSelectedPatentsData] = useState([]);
  const [fetchingData, setFetchingData] = useState(true);
  const [initialRender, setInitialRender] = useState(true);
  const [addingData, setAddingData] = useState(false);

  async function fetchPatentsData() {
    setFetchingData(true);
    setInitialRender(false);
    try {
      // Switch to first name and last name
      const retrievedData = await getPatentMatches('Steven', 'Pelech');
      console.log(retrievedData);
  
      const allDataDetails = []; // Initialize an array to accumulate data_details
      const uniqueDataDetails = new Set(); // Initialize a set to track unique entries
  
      for (const dataObject of retrievedData) {
        const { data_details } = dataObject; // Extract the data_details property
        const data_details_json = JSON.parse(data_details);
  
        // Create a unique key based on first_name, last_name, publication_number
        const uniqueKey = `${data_details_json.first_name}-${data_details_json.last_name}-${data_details_json.title}-${data_details_json.publication_date}`;
  
        // Check if the unique key is already in the set
        if (!uniqueDataDetails.has(uniqueKey)) {
          uniqueDataDetails.add(uniqueKey); // Add the unique key to the set
          allDataDetails.push(data_details_json); // Accumulate data_details
        }
      }

      console.log('allDataDetails', allDataDetails);
  
      setAllPatentsData(allDataDetails); // Set the state once after the loop
      setSelectedPatentsData(allDataDetails); // Set the selected data to all data
    } catch (error) {
      console.error('Error fetching patents data:', error);
    }
    setFetchingData(false);
  }

  const handleSelect = (patentsData, isAdded) => {
    setSelectedPatentsData(prevState => {
      if (isAdded) {
        return [...prevState, patentsData];
      } else {
        return prevState.filter(data => data !== patentsData);
      }
    });
  };

  async function addPatentsData() {
    setAddingData(true);
    for (const data of selectedPatentsData) {
      try {
        const dataJSON = JSON.stringify(data).replace(/"/g, '\\"');
        console.log('Adding new entry:', `"${dataJSON}"`);
        const result = await addUserCVData(user.user_id, section.data_section_id, `"${dataJSON}"`);
        console.log(result);
      } catch (error) {
        console.error('Error adding new entry:', error);
      }
    }
    setRetrievingData(false);
    setAddingData(false);
    fetchData();
  }

  return (
    <dialog className="modal-dialog" open>
      <button type="button" className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4" onClick={onClose}>✕</button>
      {initialRender ? (
        <div className='flex items-center justify-center w-full mt-5 mb-5'>
          <button type="button" className="btn btn-secondary" onClick={() => fetchPatentsData()}>Fetch Patents Data</button>
        </div>
      ) : (
        fetchingData ? (
          <div className='flex items-center justify-center w-full mt-5 mb-5'>
            <div className="block text-m mb-1 mt-6 text-zinc-600">
              Fetching patents data...
            </div>
          </div>
        ) : (
          <div className='flex items-center justify-center w-full mt-5 mb-5'>
            <div className="block text-m mb-1 mt-6 text-zinc-600">
              {allPatentsData.length === 0 ? (
                "No data found"
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn-secondary mb-4"
                    onClick={addPatentsData}
                    disabled={addingData}
                  >
                    {addingData ? "Adding patents data..." : "Add Patents Data"}
                  </button>
                  {allPatentsData.map((patentData, index) => (
                    <PatentsEntry key={index} patentData={patentData} onSelect={handleSelect} />
                  ))}
                </>
              )}
            </div>
          </div>
        )
      )}
    </dialog>
  );
};

export default PatentsModal;
