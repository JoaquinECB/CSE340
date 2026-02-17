-- Update account types for JWT test accounts
UPDATE public.account SET account_type = 'Employee' WHERE account_email = 'happy@340.edu';
UPDATE public.account SET account_type = 'Admin' WHERE account_email = 'manager@340.edu';

-- Verify the changes
SELECT account_firstname, account_lastname, account_email, account_type FROM public.account 
WHERE account_email IN ('basic@340.edu', 'happy@340.edu', 'manager@340.edu');
