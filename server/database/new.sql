create database IF NOT EXISTS generator_app;
create role IF NOT EXISTS generator_user login password 'generator123';
grant all privileges on database generator_app to generator_user;



