import boto3
import json
import psycopg2

sm_client = boto3.client('secretsmanager')

def getCredentials():
    credentials = {}

    response = sm_client.get_secret_value(SecretId='facultyCV/credentials/dbCredentials')
    secrets = json.loads(response['SecretString'])
    credentials['username'] = secrets['username']
    credentials['password'] = secrets['password']
    credentials['host'] = secrets['host']
    credentials['db'] = secrets['dbname']
    return credentials

def getAllUsers(arguments):
    credentials = getCredentials()
    connection = psycopg2.connect(user=credentials['username'], password=credentials['password'], host=credentials['host'], database=credentials['db'])
    print("Connected to Database")
    cursor = connection.cursor()
    
    # Update query to select all columns from the 'users' table
    cursor.execute('SELECT * FROM users')
    results = cursor.fetchall()
    cursor.close()
    connection.close()
    
    # Define a list of column names matching the 'users' table schema
    columns = [
        'user_id', 'first_name', 'last_name', 'preferred_name', 'email',
        'role', 'bio', 'rank', 'institution', 'primary_department', 'secondary_department',
        'primary_faculty', 'secondary_faculty', 'primary_affiliation', 'secondary_affiliation', 'campus', 'keywords',
        'institution_user_id', 'scopus_id', 'orcid_id', 'joined_timestamp'
    ]
    
    # Convert query results to a list of dictionaries
    users = []
    for result in results:
        user = {columns[i]: result[i] for i in range(len(columns))}
        users.append(user)
    
    return users

def lambda_handler(event, context):
    return getAllUsers(event['arguments'])
