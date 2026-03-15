B.P. MANDAL COLLEGE OF ENGINEERING, MADHEPURA
Bachelor of Technology
in
Computer Science and Engineering
A Project Report On
A Library Management Application ERP Software for
DSTTE Bihar Colleges
Submitted By
Nishant Raj 22105128040
Kriti kumari 23105128903
Under the guidance of
Prof. Manisha Kumari Singh
Assistant Professor, Computer Science Department
2022 - 2026
DECLARATION
We declare that the project entitled “ A Library Management Application ERP
Software for DSTTE Bihar Colleges” is my work conducted at B. P. Mandal
College of Engineering, Madhepura (Bihar), approved by the Committee.
I have attended more than 3 0 days of attendance with the Supervisors at the
B. P. Mandal College of Engineering, Madhepura.
I further declare that to the best of my knowledge, the report does not contain
the work which has been submitted for the award of the degree either in the
University or in any other University/Deemed University without proper
citations.
S. NO. (^) Name of Students Reg. Number Student Signature

1. Nishant Raj 22105128040
2. Kriti Kumari 23105128903
Date : ______________________
Place : ______________________
B.P. Mandal College of Engineering, Madhepura
Affiliated to
Bihar Engineering University Patna, (Bihar), India.
CERTIFICATE
This is to certify that the major project report entitled “ A Library
Management Application ERP Software for DSTTE Bihar College. ” is a
piece of Project work done by us under guidance and supervision of
Professor Md. Izhar Sir for the completion of 7th Semester, Bachelor
of Engineering of B. P. Mandal College of Engineering, Madhepura,
Bihar (India). The candidate has put in the required attendance of
more than 70 days with me. To the best of my knowledge and brief the
project:
Embodies the work of the candidate himself.
Has duly been completed.
Is up to the standard both in respect of contents and language
for being referred to the examiner.
Prof. Manisha Kumari Singh Prof Murlidhar Prasad Singh
Computer Science & Engineering
B.P .Mandal College of Engineering

Madhepura
Head of Department
Computer Science & Engineering
B.P. Mandal College of Engineering Madhepura
Date : ____________________
Place : ____________________
It is a great pleasure for me to acknowledge the assistance and support of
many individuals who have been responsible for the successful completion
of this project work.
First, We would like to express my heartfelt gratitude to B. P. Mandal College
of Engineering, Madhepura for providing me with the opportunity to pursue
my Bachelor’s degree at this esteemed institution and for supporting me
throughout this minor project in my 7th semester.
We would like to express my deepest gratitude to Prof. Arbind Kumar Amar,
Principal, B. P. Mandal College of Engineering, Madhepura, for his constant
encouragement and support throughout the course of this project.
We would also like to thank Prof. Murlidhar Prasad Singh, Head of the
Department, Computer Science and Engineering, B. P. Mandal College of
Engineering, Madhepura, for his valuable guidance and support.
We express our sincere gratitude to Prof. Manisha Kumari Singh, our project
guide for his expert guidance and for providing his time and valuable
suggestions at every step of this project.
We would like to thank the faculty and staff of the Computer Science and
Engineering department for their support.
We are also grateful to my family and friends for their constant
encouragement and support throughout the course of this project. Lastly, I
would like to thank everyone who directly or indirectly helped me in the
successful completion of this project.
Date: ________________________
Place: _______________________
Nishant Raj (2 2105128040 )
Kriti Kumari (2 3105128903 )
B. P. Mandal College of Engineering, Madhepura
Affiliated to
Bihar Engineering University Patna, Bihar, India
The project work entitled “ A Library Management Application ERP Software
for DSTTE Bihar College ” being submitted by Nishant Raj ( 22105128040 ),
Kriti kumari (23105128903), has been examined by us and is hereby approved
for the completion of 7th Semester, B. Tech (COMPUTER SCIENCE AND
ENGINEERING) for which it has been submitted.
It is understood that by this approval the undersigned does not necessarily
endorse or approve any statement made, opinion expressed or conclusion
drawn therein, but approve the project work only for the purpose for which it
has been submitted.
Internal Examiner

Head of Department

COMPUTER SCIENCE AND ENGINEEIRNG

BP Mandal College of Engineering,
Madhepura

External Examiner
The Library Management System ERP (LMS) is an advanced software system
designed specifically for the libraries of colleges under the Department of
Science, Technology, and Technical Education. This system is capable of
automating and intelligently keeping records of library operations which
improves the overall efficiency of managing the library.
The distinctive characteristic of the system is its ability to connect with barcode
scanners. The software is designed to take barcode input which enables users to
scan the International Standard Book Numbers (ISBNs) and subsequently, books
can be added into the system very quickly and accurately. This use of barcodes
minimizes the manual effort required towards issuing and returning books to the
library, managing the inventory, and subsequently merging records. Most
importantly, this system also minimizes human error.
The LMS is designed to manage important modules like Book Management,
Member Registration, Issue/Return System, Fine Calculation, Search
Functioning, and Report Generation. All these features are incorporated within
an intuitive graphical interface so that even users with little to no experience of
technology can operate it. The development will sustain the changing needs of
educational institutions with growing library facilities and be user friendly.
In addition to core library operations, the LMS includes a robust data
synchronization feature that ensures consistency between local (offline)
installations and the centralized web-based system. This synchronization
mechanism is implemented using a custom-built API , specifically designed to
securely and efficiently handle bidirectional data transfer.
The synchronization feature supports:
Local-to-Web Sync : Automatically uploads newly added or updated
records (such as books, members, issue/return logs, and fine details) from
the local system to the web server.
Web-to-Local Sync : Fetches updated data from the web platform and
integrates it into the local database, ensuring that all systems remain up
to date.
This bidirectional synchronization enables institutions to operate the LMS both
online and offline , without the risk of data inconsistency or loss. It is particularly
beneficial for environments with intermittent internet connectivity, as data can
be synchronized whenever a network connection becomes available. The
custom API ensures secure communication, controlled access, and reliable data
integrity during the synchronization process.
QR For Downloading the software (^) Web Interface

Table of Content
SI. No (^) Content Page Number

01 Title Page 01
02 Declaration 02
03 Certificate 03
04 Acknowledgment 04
05 Abstract 06
06 Table of Contents 07
07 List of Figures 09
08 List of Tables 09
09 Abbreviations / Acronyms 10
10
Chapter 1: Introduction
1.2 Background of the Project
1.2 Problem Statement
1.3 Objectives
1.4 Scope of the Project
5 Methodology Overview
1.6 Organization of the Report
11
11
Chapter 2: Literature Review / Existing System
2.1 Existing Systems / Related Work
2.2 Limitations of Existing Systems
2.3 Proposed System Overview
14
12
Chapter 3: Software Requirements Specification
3.1 Introduction
3.2 Purpose
3.3 Overall Description
3.4 Functional Requirements
3.5 Non-Functional Requirements
3.6 System Models (Use Case, DFDs if any)
16
13
Chapter 4: System Design
4.1 System Architecture
4.2 Database Design (ER Diagrams, Schema)
4.3 UML Diagrams (Use Case, Sequence, Class Diagram, etc.)
22
14
Chapter 5: Implementation
5.1 Development Tools and Technologies Used
5.2 Module-wise Implementation
27
15
Chapter 6: Testing
6.1 Testing Methodologies
6.2 Test Cases and Results
30
16
Chapter 7: Results and Discussion
7.1 Final Output Screens
32
17
Chapter 8: Conclusion and Future Scope
8.1 Conclusion
8.2 Limitations
8.3 Future Enhancements
34
18 References / Bibliography 36
19
Appendices
A. Sample Reports
B. User Manual / Installation Guide
37
➢ Figure 3.6.1 Use Case Diagram

➢ Figure 3.6.2 Data Flow Diagram

➢ Figure 4.3 UML Case Figure

➢ Figure 7.1 set up windows of the software

➢ Figure 7.2 Dashboard Screenshot

➢ Figure 7.3 Adding Book

➢ Figure 7.4 Adding Students

➢ Figure 7.5 Book Lending

➢ Figure 7.6 Institution

➢ Figure 7.7 Sync Module

➢ Figure 7. 8 Settings

➢

➢

➢ A.1 Book Inventory Report

➢ A.2 Issued Books Report

➢ A.3 Student Report

➢ 4.5 Database Design

➢ 5.2.1 Hardware Requirements table

➢ 5.2.2 Software Requirements Table

➢ 6.3 Test Cases

Chapter 1: Introduction
Shows how the Librarian interacts with the system

Table Name Column Name Data Type Constraints

institution
name TEXT^
address TEXT
university TEXT
college_code TEXT
established_year TEXT
principal_name TEXT
library_incharge TEXT
phone TEXT
email TEXT
website TEXT
logo_path TEXT
book_limit INTEGER
lend_duration INTEGER
fine_rate REAL
is_setup_complete INTEGER DEFAULT 0
branches (^) nameid^ INTEGERTEXT PRIMARY KEYUNIQUE
sessions (^) nameid^ INTEGERTEXT PRIMARY KEYUNIQUE
students
id INTEGER PRIMARY KEY
name TEXT
roll_no TEXT UNIQUE
phone TEXT
branch_id INTEGER FOREIGN KEY (branches.id)
session_id INTEGER FOREIGN KEY (sessions.id)
is_blocked INTEGER DEFAULT 0
books
id INTEGER PRIMARY KEY
title TEXT
author TEXT
isbn TEXT UNIQUE
total_copies INTEGER
available_copies INTEGER
added_date TEXT (^) CURRENT_TIMESTAMPDEFAULT
book_loans
id INTEGER PRIMARY KEY
student_id INTEGER FOREIGN KEY (students.id)
book_id INTEGER FOREIGN KEY (books.id)
issue_date TEXT
due_date TEXT
return_date TEXT
fine_amount REAL DEFAULT 0
is_returned INTEGER DEFAULT 0

Since there is no login system, the interface directly loads the main dashboard with the
following options:
➢ Book Management
➢ Add New Book
➢ View/Edit Books
➢ Search Books
➢ Student Management
➢ Register New Student
➢ View Student Details
➢ Book Transactions
➢ Issue Book
➢ Return Book & Fine Calculation
➢ Reports
➢ Daily/Monthly Issue Reports
➢ Overdue Books Report
➢ Bidirectional Data Sync

This chapter focuses on the implementation of the Library Management System (LMS) for DSTTE
Bihar Colleges. It details the software development environment, programming languages, database
configurations, system setup, and deployment process. Since this system does not include a login
system, all functionalities are accessible directly upon launching the application.

The Library Management System was implemented in the following phases:
Database Type: SQLite (lightweight, no external server required).
Schema Definition: Tables for books, students, and transactions were created.
Normalization: Ensured no redundancy in storing book and student information.
Developed using PyQt5 for an interactive GUI.

Designed four main sections:

➢ Books Management
➢ Student Management
➢ Book Issuance & Return
➢ Report Generation
3. Issuance & Return Module

➢ Issuing books, setting due dates
➢ Processing returns and calculating fines
4. Report Generation

5. Syncing with Web ERP

After implementing each module, the system was tested using unit testing, integration
testing, and user testing.
Chapter 6: Testing & Evaluation
This chapter discusses the testing methodologies, test cases, and evaluation results of the
Library Management System (LMS) ERP for DSTTE Bihar Colleges. Since the system does not
include a login system, the focus is on testing core functionalities, including book
management, student management, book issuance, return processing, and report
generation.

Chapter 7: Results and Discussion
References/ Bibliography
Appendices