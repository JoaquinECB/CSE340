-- Insert JWT Authorization Test Accounts
-- These accounts are for testing JWT authorization functionality
INSERT INTO public.account (
        account_firstname,
        account_lastname,
        account_email,
        account_password,
        account_type
    )
VALUES (
        'Basic',
        'Client',
        'basic@340.edu',
        '$2b$10$ej0HVMEz1QKFV3PstNVYbO3IKzbkkjLqZZwVCdbHwL6tJSwz1KpjC',
        'Client'
    ),
    (
        'Happy',
        'Employee',
        'happy@340.edu',
        '$2b$10$CH2AiPixc6e/EBxfqJVdpOkbNRnRDM35.wa.Cjk27QlPdvTEti8Ri',
        'Employee'
    ),
    (
        'Manager',
        'User',
        'manager@340.edu',
        '$2b$10$ooH09UkbbHOlJzmoeGYV6upsVrFELZAPZikhSVJTa/qCe9.7Jnlxi',
        'Admin'
    );
-- Passwords for reference (NOT stored, just for documentation):
-- Basic Client: I@mABas1cCl!3nt
-- Happy Employee: I@mAnEmpl0y33
-- Manager User: I@mAnAdm!n1strat0r