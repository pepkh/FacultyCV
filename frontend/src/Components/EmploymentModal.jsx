import React, { useState } from 'react';
import '../CustomStyles/scrollbar.css';
import '../CustomStyles/modal.css';
import { addUserCVData, getUserCVData, getOrcidSections } from '../graphql/graphqlHelpers';

const EmploymentModal = ({ user, section, onClose, setRetrievingData, fetchData }) => {
  const [employmentData, setEmploymentData] = useState([]);
  const [fetchingData, setFetchingData] = useState(true);
  const [addingData, setAddingData] = useState(false);
  const [initialRender, setInitialRender] = useState(true);
  const [count, setCount] = useState(1);
  const [showAdviceDialog, setShowAdviceDialog] = useState(false);


  // Function to fetch employment data from ORCID
  // async function fetchEmploymentData() {
  //   setFetchingData(true);
  //   setInitialRender(false);

  //   try {
  //     const response = await getOrcidSections(user.orcid_id,'employment');

  //     if (response?.other_data) {
  //       const otherData = typeof response.other_data === 'string' 
  //         ? JSON.parse(response.other_data) 
  //         : response.other_data;

  //       const employmentList = otherData?.employment_list || [];

  //       // Transform fields to match the database structure
  //       const transformedData = employmentList.map((employment) => ({
  //         start_date: {
  //           month: employment["Start Month"] || "",
  //           year: employment["Start Year"] || "",
  //         },
  //         end_date: {
  //           month: employment["End Month"] || "",
  //           year: employment["End Year"] || "present",
  //         },
  //         rank_or_title: employment["Role Title"] || "",
  //         university_or_organization: employment["Organization"] || "",
  //       }));

  //       setEmploymentData(transformedData);
        
  //     } else {
  //       console.error('No employment data found in response.');
  //     }
  //   } catch (error) {
  //     console.error('Error fetching employment data:', error);
  //   }
  //   setFetchingData(false);
  // }

  // async function fetchEmploymentData() {
  //   setFetchingData(true);
  //   setInitialRender(false);
  
  //   try {
  //     const response = await getOrcidSections(user.orcid_id, 'employment');
  
  //     if (response?.other_data) {
  //       const otherData = typeof response.other_data === 'string'
  //         ? JSON.parse(response.other_data)
  //         : response.other_data;
  
  //       const employmentList = otherData?.employment_list || [];
  
  //       // Fetch the form structure from `section.attributes`
  //       if (typeof section.attributes === 'string') {
  //         section.attributes = JSON.parse(section.attributes);
  //       }
  
  //       // const transformedData = employmentList.map((employment) => {
  //       //   const entry = Object.keys(section.attributes).reduce((acc, key) => {
  //       //     const fieldKey = key.toLowerCase().replace(/ /g, '_');
  //       //     if (fieldKey === 'start_date') {
  //       //       acc[fieldKey] = {
  //       //         month: employment["Start Month"] || "",
  //       //         year: employment["Start Year"] || "",
  //       //       };
  //       //     } else if (fieldKey === 'end_date') {
  //       //       acc[fieldKey] = {
  //       //         month: employment["End Month"] || "",
  //       //         year: employment["End Year"] || "present",
  //       //       };
  //       //     } else if (fieldKey === 'rank_or_title') {
  //       //       acc[fieldKey] = employment["Role Title"] || "";
  //       //     } else if (fieldKey === 'university_or_organization') {
  //       //       acc[fieldKey] = employment["Organization"] || "";
  //       //     } else {
  //       //       acc[fieldKey] = ""; // Default for any unexpected fields
  //       //     }
  //       //     return acc;
  //       //   }, {});
  //       //   return entry;
        
  //       // });


  //       // Transform the data to match the form structure
  //       const transformedData = employmentList.map((employment) => ({
  //         startDateMonth: employment["Start Month"] || "",
  //         startDateYear: employment["Start Year"] || "",
  //         endDateMonth: employment["End Month"] === "present" ? "Current" : employment["End Month"] || "",
  //         endDateYear: employment["End Year"] === "N/A" || employment["End Year"] === "present" ? "None" : employment["End Year"] || "",
  //         rank_or_title: employment["Role Title"] || "",
  //         university_or_organization: employment["Organization"] || "",
  //       }));

  //       setEmploymentData(transformedData);

  
  //       // Update the state with the transformed data
  //       setEmploymentData(transformedData);
  //     } else {
  //       console.error('No employment data found in response.');
  //     }
  //   } catch (error) {
  //     console.error('Error fetching employment data:', error);
  //   }
  
  //   setFetchingData(false);
  // }


  async function fetchEmploymentData() {
    setFetchingData(true);
    setInitialRender(false);

    try {
        const response = await getOrcidSections(user.orcid_id, 'employment');

        if (response?.other_data) {
            const otherData = typeof response.other_data === 'string'
                ? JSON.parse(response.other_data)
                : response.other_data;

            const employmentList = otherData?.employment_list || [];

            // Transform fields into the required escaped JSON format
            const transformedData = employmentList.map((employment) => {
                const startDateMonth = employment["Start Month"] || "";
                const startDateYear = employment["Start Year"] || "";
                const endDateMonth = employment["End Month"] === "present" ? "Current" : employment["End Month"] || "";
                const endDateYear = employment["End Year"] === "N/A" || employment["End Year"] === "present" ? "None" : employment["End Year"] || "";

                const dates =
                    endDateMonth === "Current"
                        ? `${startDateMonth}, ${startDateYear} - Current`
                        : endDateMonth === "None"
                        ? `${startDateMonth}, ${startDateYear}`
                        : `${startDateMonth}, ${startDateYear} - ${endDateMonth}, ${endDateYear}`;

                const dataObject = {
                    "university/organization": employment["Organization"] || "",
                    "rank_or_title": employment["Role Title"] || "",
                    "dates": dates,
                };

                // Create escaped JSON string
                return JSON.stringify(dataObject).replace(/"/g, '\\"');
            });

            setEmploymentData(transformedData);
        } else {
            console.error('No employment data found in response.');
        }
    } catch (error) {
        console.error('Error fetching employment data:', error);
    }
    setFetchingData(false);
}

  

  // Function to add employment data to the database
  async function addEmploymentData() {
    setAddingData(true);

    try {
        const existingEmployment = await getUserCVData(user.user_id, section.data_section_id);
        const existingData = existingEmployment.map((entry) => JSON.stringify(entry.data_details));

        for (const employment of employmentData) {
            // Skip if the data already exists
            if (existingData.includes(employment)) {
                setCount((prevCount) => prevCount + 1);
                continue;
            }

            // Add the new data to the database
            try {
                await addUserCVData(user.user_id, section.data_section_id, `"${employment}"`, false);
                setCount((prevCount) => prevCount + 1);
            } catch (error) {
                console.error('Error adding employment entry:', error);
            }
        }
    } catch (error) {
        console.error('Error during addEmploymentData:', error);
    }

    setAddingData(false);
    fetchData(); // Refresh parent data
    setRetrievingData(false);
    setShowAdviceDialog(true)
}

  // async function addEmploymentData() {
  //   setAddingData(true);

  //   try {
  //     // Get existing data to avoid duplicates
  //     const existingEmployment = await getUserCVData(user.user_id, section.data_section_id);
  //     const existingData = existingEmployment.map((entry) => JSON.stringify(entry.data_details));
  //     console.log(existingData)

  //     for (const employment of employmentData) {
  //       const employmentJSON = JSON.stringify(employment).replace(/\\/g, '\\\\').replace(/"/g, '\\"');


  //       // Skip adding if the data already exists
  //       if (existingData.includes(employmentJSON)) {
  //         setCount((prevCount) => prevCount + 1);
  //         continue;
  //       }

  //       // Add new data to the database
  //       try {
  //         await addUserCVData(user.user_id, section.data_section_id, `"${employmentJSON}"`, false);
  //         setCount((prevCount) => prevCount + 1);
  //       } catch (error) {
  //         console.error('Error adding employment entry:', error);
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error during addEmploymentData:', error);
  //   }

  //   setAddingData(false);
  //   fetchData(); // Refresh parent data
  //   setRetrievingData(false);
  // }

  return  (
    <dialog className="modal-dialog" open>
      <button
        type="button"
        className={`btn btn-sm btn-circle btn-ghost absolute right-4 top-4 ${fetchingData && !initialRender ? 'cursor-not-allowed' : ''}`}
        onClick={onClose}
        disabled={fetchingData && !initialRender}
      >
        ✕
      </button>
  
      {initialRender ? (
        user.orcid_id ? (
          <div className="flex flex-col items-center justify-center w-full mt-5 mb-5">
            <div className="text-center">
              Employment data will be fetched from ORCID using your ORCID ID.
            </div>
            <button
              type="button"
              className="btn btn-secondary mt-4 text-white"
              onClick={() => fetchEmploymentData()}
            >
              Fetch Employment Data
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full mt-5 mb-5">
            <div className="block text-m mb-1 mt-6 mr-5 ml-5 text-zinc-600">
              Please enter your ORCID ID in the Profile section to fetch employment data.
            </div>
          </div>
        )
      ) : fetchingData ? (
        <div className="flex items-center justify-center w-full mt-5 mb-5">
          <div className="block text-lg font-bold mb-2 mt-6 text-zinc-600">
            Fetching employment data...
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full mt-5 mb-5">
          {employmentData.length > 0 ? (
            <div>
              <p className="mb-4">Employment data fetched successfully.</p>
              <p className = "mb-3"> It is advised that you add the start and end dates to your employment records.</p>
              <button
                type="button"
                className="btn btn-secondary text-white flex items-center justify-center"
                onClick={() => addEmploymentData()}
                disabled={addingData}
              >
                {addingData ? `Adding ${count} of ${employmentData.length} records...` : 'Add Employment Data'}
              </button>
            </div>
          ) : (
            <p>No employment data found.</p>
          )}
        </div>
      )}
  
    </dialog>
  );
  
};

export default EmploymentModal;



// import React, { useState } from 'react';
// import '../CustomStyles/scrollbar.css';
// import '../CustomStyles/modal.css';
// import { addUserCVData } from '../graphql/graphqlHelpers';
// import { getOrcidSections } from '../graphql/graphqlHelpers';

// const EmploymentModal = ({ user, section, onClose, setRetrievingData, fetchData }) => {
//   const [employmentData, setEmploymentData] = useState([]);
//   const [fetchingData, setFetchingData] = useState(true);
//   const [addingData, setAddingData] = useState(false);
//   const [initialRender, setInitialRender] = useState(true);

//   // Function to fetch employment data using getOrcidSections
//   async function fetchEmploymentData() {
//     setFetchingData(true);
//     setInitialRender(false);

//     try {
//       // Call getOrcidSections to retrieve employment data
//       const response = await getOrcidSections(user.orcid_id, 'employment');

//       if (response?.other_data) {
//         const otherData = typeof response.other_data === 'string'? JSON.parse(response.other_data)
//           : response.other_data;

//         if (otherData?.employment_list) {
//           setEmploymentData(otherData.employment_list);
//         } else {
//           console.error('No employment data found in response.');
//         } 
//       } else {
//           console.error('No field for employment data');
//       }
//     } catch (error) {
//       console.error('Error fetching employment data:', error);
//     }
//     setFetchingData(false);
//   }

//   // Function to add employment data to user CV
//   async function addEmploymentData() {
//     setAddingData(true);
//     for (const employment of employmentData) {
//       try {
//         const employmentJSON = JSON.stringify(employment).replace(/"/g, '\\"');
//         await addUserCVData(user.user_id, section.data_section_id, `"${employmentJSON}"`, false);
//       } catch (error) {
//         console.error('Error adding employment data:', error);
//       }
//     }
//     setAddingData(false);
//     fetchData(); // Refresh parent data
//     setRetrievingData(false);
//   }

//   return (
//     <dialog className="modal-dialog" open>
//       <button
//         type="button"
//         className={`btn btn-sm btn-circle btn-ghost absolute right-4 top-4 ${fetchingData && !initialRender ? 'cursor-not-allowed' : ''}`}
//         onClick={onClose}
//         disabled={fetchingData && !initialRender}
//       >
//         ✕
//       </button>
//       {initialRender ? (
//         user.orcid_id ? (
//           <div className="flex flex-col items-center justify-center w-full mt-5 mb-5">
//             <div className="text-center">
//               Employment data will be fetched from ORCID using your ORCID ID.
//             </div>
//             <button
//               type="button"
//               className="btn btn-secondary mt-4 text-white"
//               onClick={fetchEmploymentData}
//             >
//               Fetch Employment Data
//             </button>
//           </div>
//         ) : (
//           <div className="flex items-center justify-center w-full mt-5 mb-5">
//             <div className="block text-m mb-1 mt-6 mr-5 ml-5 text-zinc-600">
//               Please enter your ORCID ID in the Profile section to fetch employment data.
//             </div>
//           </div>
//         )
//       ) : fetchingData ? (
//         <div className="flex items-center justify-center w-full mt-5 mb-5">
//           <div className="block text-lg font-bold mb-2 mt-6 text-zinc-600">
//             Fetching employment data...
//           </div>
//         </div>
//       ) : (
//         <div className="flex flex-col items-center justify-center w-full mt-5 mb-5">
//           {employmentData.length > 0 ? (
//             <div>
//               <p className="mb-4">Employment data fetched successfully.</p>
//               <button
//                 type="button"
//                 className="btn btn-secondary text-white"
//                 onClick={addEmploymentData}
//                 disabled={addingData}
//               >
//                 {addingData ? 'Adding Employment Data...' : 'Add Employment Data'}
//               </button>
//             </div>
//           ) : (
//             <p>No employment data found.</p>
//           )}
//         </div>
//       )}
//     </dialog>
//   );
// };

// export default EmploymentModal;
