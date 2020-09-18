import Storage from '@aws-amplify/storage';
import Auth from '@aws-amplify/auth';
import awsconfig from './../aws-exports';

Storage.configure(awsconfig);
Auth.configure(awsconfig);

export default (key: string) => Storage.get(key);
