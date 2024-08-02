export const getUserQuery = (email) => `
    query GetUser {
        getUser (
            email: "${email}"
        ) {
            user_id
            first_name
            last_name
            preferred_name
            email
            role
            bio
            rank
            primary_department
            secondary_department
            primary_faculty
            secondary_faculty
            campus
            keywords
            institution_user_id
            scopus_id
            orcid_id
        }
    }
`;

export const getExistingUserQuery = (institution_user_id) => `
    query GetExistingUser {
        getExistingUser (
            institution_user_id: "${institution_user_id}"
        ) {
            user_id
            first_name
            last_name
            preferred_name
            email
            role
            bio
            rank
            primary_department
            secondary_department
            primary_faculty
            secondary_faculty
            campus
            keywords
            institution_user_id
            scopus_id
            orcid_id
        }
    }
`;

export const getAllSectionsQuery = () => `
    query GetAllSections {
        getAllSections {
            attributes
            data_section_id
            data_type
            description
            title
        }
    }
`;

export const getUserCVDataQuery = (user_id, data_section_id) => `
    query GetUserCVData {
        getUserCVData (
            user_id: "${user_id}",
            data_section_id: "${data_section_id}"
        ) {
            user_cv_data_id
            user_id
            data_section_id
            data_details
        }
    }
`;

export const getArchivedUserCVDataQuery = (user_id) => `
    query GetArchivedUserCVData {
        getArchivedUserCVData (
            user_id: "${user_id}",
        ) {
            user_cv_data_id
            user_id
            data_section_id
            data_details
            archive
            archive_timestamp
        }
    }
`;

export const getAllUniversityInfoQuery = () => `
    query GetAllUniversityInfo {
        getAllUniversityInfo {
            university_info_id
            type
            value
        }
    }
`;

export const getElsevierAuthorMatchesQuery = (first_name, last_name, institution_name) => `
    query getElsevierAuthorMatches {
        getElsevierAuthorMatches (
            first_name: "${first_name}", last_name: "${last_name}", institution_name: "${institution_name}"
        ) {
            last_name,
            first_name,
            name_variants,
            subjects,
            current_affiliation,
            scopus_id,
            orcid
        }
    }
`;


export const getOrcidAuthorMatchesQuery = (first_name, last_name, institution_name) => `
    query getOrcidAuthorMatches {
        getOrcidAuthorMatches (
            first_name: "${first_name}", last_name: "${last_name}", institution_name: "${institution_name}"
        ) {
            last_name,
            first_name,
            credit_name
            name_variants,
            keywords,
            orcid_id,
            researcher_urls
            }
    }
`;

export const getUserConnectionsQuery = (user_id) => `
    query GetUserConnections {
        getUserConnections (
            user_id: "${user_id}",
        ) {
            user_connection_id
            user_id
            user_connection
        }
    }
`;

export const getAllTemplatesQuery = () => `
    query GetAllTemplates {
        getAllTemplates {
            template_id
            title
            data_section_ids
        }
    }
`;

export const getTeachingDataMatchesQuery = (institution_user_id) => `
    query GetTeachingDataMatches {
        getTeachingDataMatches (
            institution_user_id: "${institution_user_id}",
        ) {
            teaching_data_id
            institution_user_id
            data_details
        }
    }
`;

export const getPublicationMatchesQuery = (scopus_id, page_number, results_per_page) => `
    query GetPublicationMatches {
        getPublicationMatches (
            scopus_id: "${scopus_id}",
            page_number: ${page_number},
            results_per_page: ${results_per_page}
        ) {
            publications {
                publication_id
                title
                cited_by
                keywords
                journal
                link
                doi
                year_published
                author_names
                author_ids
            }
            total_results
            current_page
            total_pages
        }
    }
`;