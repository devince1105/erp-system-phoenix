-- Initial SQL Script for ERP Phoenix Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = N'ERPPhoenixDB')
BEGIN
    CREATE DATABASE [ERPPhoenixDB]
    COLLATE Chinese_Taiwan_Stroke_CI_AS;
END
GO

USE [ERPPhoenixDB];
GO

-- Create Schema if needed
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'account')
BEGIN
    EXEC('CREATE SCHEMA [account]');
END
GO
