const http = require('http');
const fs = require('fs');
const path = require('path');

const hostname = '127.0.0.1';
const port = 3000;

// HTML Templates
const templates = {
  homepage: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Santhéa Hospital - Quality Healthcare Services</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        /* Global Styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Arial', sans-serif;
        }
        
        body {
            line-height: 1.6;
            color: #333;
        }
        
        .container {
            width: 90%;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .btn {
            display: inline-block;
            background-color: #ff3333;
            color: white;
            padding: 12px 30px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            transition: all 0.3s;
            border: none;
            cursor: pointer;
        }
        
        .btn:hover {
            background-color: #cc0000;
            transform: translateY(-2px);
        }
        
        h2 {
            font-size: 2rem;
            margin-bottom: 1.5rem;
            color: #0066cc;
            text-align: center;
        }
        
        section {
            padding: 50px 0;
        }
        
        /* Header Styles */
        header {
            background-color: #0066cc;
            color: white;
            padding: 1rem 0;
        }
        
        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            display: flex;
            align-items: center;
        }
        
        .logo img {
            height: 60px;
            margin-right: 15px;
        }
        
        .logo-text h1 {
            font-size: 1.8rem;
            margin-bottom: 5px;
        }
        
        .logo-text p {
            font-size: 0.9rem;
            opacity: 0.9;
        }
        
        /*emergency*/
        .emergency-btn-nav {
    background-color: #ff3333; /* Changed to red for emergency */
    color: white;
    padding: 8px 20px;
    border-radius: 5px;
    text-decoration: none;
    font-weight: bold;
    transition: all 0.3s;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    margin-left: 10px;
}

.emergency-btn-nav:hover {
    background-color: #cc0000;
    transform: translateY(-2px);
}

.emergency-btn-nav i {
    margin-right: 8px;
}
        /* Navigation */
        nav {
            background-color: #004d99;
        }
        
        .nav-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.8rem 0;
        }
        
        nav ul {
            display: flex;
            list-style: none;
        }
        
        nav ul li {
            margin-right: 15px;
        }
        
        nav ul li a {
            color: white;
            text-decoration: none;
            font-weight: 500;
            padding: 8px 12px;
            border-radius: 3px;
            transition: all 0.3s;
            display: flex;
            align-items: center;
        }
        
        nav ul li a i {
            margin-right: 8px;
            font-size: 1rem;
        }
        
        nav ul li a:hover {
            background-color: #003366;
        }
        /* Login Button Styles */
        .login-btn-nav {
            background-color: #2ecc71;
            color: white;
            padding: 8px 20px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            transition: all 0.3s;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            margin-left: 10px;
        }
        
        .login-btn-nav:hover {
            background-color: #27ae60;
            transform: translateY(-2px);
        }
        
        .login-btn-nav i {
            margin-right: 8px;
        }

        
        /* Hero Section */
        .hero {
            background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');
            background-size: cover;
            background-position: center;
            height: 500px;
            display: flex;
            align-items: center;
            color: white;
            text-align: center;
        }
        
        .hero-content {
            width: 100%;
        }
        
        .hero h2 {
            font-size: 2.5rem;
            margin-bottom: 20px;
            color: white;
        }
        
        .hero p {
            font-size: 1.2rem;
            margin-bottom: 30px;
            max-width: 700px;
            margin-left: auto;
            margin-right: auto;
        }
        
        /* Quick Links */
        .quick-links {
            background-color: #ebf3fb;
        }
        
        .links-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
        }
        
        .link-card {
            background-color: #90CAF9;
            padding: 25px;
            border-radius: 5px;
            text-align: center;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
            transition: all 0.3s;
        }
        
        .link-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .link-card i {
            font-size: 2.5rem;
            color: #0066cc;
            margin-bottom: 15px;
        }
        
        .link-card h3 {
            margin-bottom: 10px;
            color: #0066cc;
        }
        
        .link-card p {
            margin-bottom: 15px;
            font-size: 0.9rem;
        }
        
        .link-card .btn {
            padding: 8px 15px;
            font-size: 0.9rem;
        }
        
        /* About Us */
        .about-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 30px;
        }
        
        .about-card {
            background-color:#E1F5FE;
            border: 1px solid #ddd;
            border-radius: 5px;
            overflow: hidden;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
            transition: all 0.3s;
        }
        .about-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        

        
        .about-card img {
            width: 100%;
            height: 200px;
            object-fit: cover;
        }
        
        .about-content {
            padding: 20px;
        }
        
        .about-content h3 {
            margin-bottom: 10px;
            color: #0066cc;
        }
        
        /* Services */
        .services-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 30px;
        }
        
        .service-card {
            background-color: #E3F2FD;
            border: 1px solid #E3F2FD;
            border-radius: 5px;
            overflow: hidden;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
            transition: all 0.3s;
        }
        
        .service-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .service-card img {
            width: 100%;
            height: 200px;
            object-fit: cover;
        }
        
        .service-content {
            padding: 20px;
        }
        
        .service-content h3 {
            margin-bottom: 10px;
            color: #0066cc;
        }
        
        .service-content a {
            color: #0066cc;
            text-decoration: none;
            font-weight: bold;
            display: inline-block;
            margin-top: 10px;
        }
        
        .service-content a:hover {
            text-decoration: underline;
        }
        
        /* Doctors */
        .doctors {
            background-color: #f5f5f5;
        }
        
        .doctors-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
        }
        
        .doctor-card {
            background-color: white;
            border-radius: 5px;
            overflow: hidden;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
            text-align: center;
            transition: all 0.3s;
        }
        
        .doctor-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .doctor-card img {
            width: 100%;
            height: 250px;
            object-fit: cover;
        }
        
        .doctor-info {
            padding: 20px;
        }
        
        .doctor-info h3 {
            margin-bottom: 5px;
            color: #0066cc;
        }
        
        .doctor-info p {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 10px;
        }
        
        
        
        /* Testimonials */
        .testimonial-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 30px;
        }
        
        .testimonial-card {
            background-color: #76a3d2;
            padding: 25px;
            border-radius: 5px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
              transition: all 0.3s;

        }
        .testimonial-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        
        .testimonial-card p {
            font-style: italic;
            margin-bottom: 20px;
        }
        
        .patient-info {
            display: flex;
            align-items: center;
        }
        
        .patient-info img {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            margin-right: 15px;
            object-fit: cover;
        }
        
        .rating {
            color: #ffcc00;
            margin-top: 5px;
        }
        
        /* Contact */
        .contact-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 30px;
        }
        
        .contact-card {
            background-color: rgb(148, 255, 255);
            padding: 25px;
            border-radius: 5px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
            text-align: center;
              transition: all 0.3s;

        }
        .contact-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        
        .contact-card i {
            font-size: 2rem;
            color: #0066cc;
            margin-bottom: 15px;
        }
        
        .contact-card h3 {
            margin-bottom: 15px;
            color: #0066cc;
        }
        
        /* Footer */
        footer {
            background-color: #124d87;
            color: white;
            padding: 50px 0 20px;
        }
        
        .footer-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .footer-column h3 {
            margin-bottom: 20px;
            font-size: 1.2rem;
        }
        
        .footer-column ul {
            list-style: none;
        }
        
        .footer-column ul li {
            margin-bottom: 10px;
        }
        
        .footer-column ul li a {
            color: #ddd;
            text-decoration: none;
            transition: color 0.3s;
        }
        
        .footer-column ul li a:hover {
            color: white;
        }
        
        .contact-info p {
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }
        
        .contact-info i {
            margin-right: 10px;
            width: 20px;
            text-align: center;
        }
        
        .social-links {
            margin-top: 15px;
        }
        
        .social-links a {
            color: white;
            margin-right: 15px;
            font-size: 1.5rem;
            transition: color 0.3s;
        }
        
        .social-links a:hover {
            color: #66b3ff;
        }
        
        .copyright {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #004d99;
            font-size: 0.9rem;
            color: #aaa;
        }
        
        .copyright a {
            color: #aaa;
            text-decoration: none;
            margin: 0 10px;
        }
        
        .copyright a:hover {
            text-decoration: underline;
        }
        
        /* Responsive Design */
        @media (max-width: 1024px) {
            .links-grid, .doctors-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .about-grid, .services-grid, .testimonial-grid, .contact-grid {
                grid-template-columns: 1fr;
            }
            
            .footer-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        
        @media (max-width: 768px) {
            .header-top {
                flex-direction: column;
                text-align: center;
            }
            
            .logo {
                justify-content: center;
                margin-bottom: 15px;
            }
            
            .emergency-contact {
                justify-content: center;
            }
            
            nav ul {
                flex-direction: column;
                align-items: center;
            }
            
            nav ul li {
                margin: 5px 0;
            }
            
            .hero {
                height: 400px;
            }
            
            .hero h2 {
                font-size: 2rem;
            }
            
            .form-row {
                grid-template-columns: 1fr;
            }
        }
        
        @media (max-width: 480px) {
            .links-grid, .doctors-grid, .footer-grid {
                grid-template-columns: 1fr;
            }
            
            .hero {
                height: 350px;
            }
            
            .hero h2 {
                font-size: 1.8rem;
            }
            
            .hero p {
                font-size: 1rem;
            }
        }

    </style>
     <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <script src="/js/dashboard.js"></script>
</head>
<body>
    <!-- Header -->
   <!-- Header -->
<header>
    <div class="container header-top">
        <div class="logo">
            <img src="https://sdmntprsouthcentralus.oaiusercontent.com/files/00000000-8768-61f7-b953-a07881ac2f73/raw?se=2025-06-25T19%3A37%3A14Z&sp=r&sv=2024-08-04&sr=b&scid=7295d1ce-33d8-5b27-9e1a-9760b1b78538&skoid=04233560-0ad7-493e-8bf0-1347c317d021&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-06-25T16%3A17%3A56Z&ske=2025-06-26T16%3A17%3A56Z&sks=b&skv=2024-08-04&sig=HniXra3FcjeBrXY17GY338gpOaKVFVMNricoHg7oPeI%3D" alt="Santhéa Hospital">
            <div class="logo-text">
                <h1>Santhéa Hospital</h1>
                <p>Compassionate Care, Advanced Medicine</p>
            </div>
        </div>
        
        <div class="emergency-contact">
            <a href="emergency.html" class="emergency-btn-nav">
                <i class="fas fa-ambulance"></i> Emergency
            </a>
        </div>
    </div>
</header>
    
    <!-- Navigation -->
    <nav>
        <div class="container nav-container">
            <ul>
                <li><a href="#Home"><i class="fas fa-home"></i> Home</a></li>
                <li><a href="#about"><i class="fas fa-info-circle"></i> About Us</a></li>
                <li><a href="#services"><i class="fas fa-procedures"></i> Services</a></li>
                <li><a href="#doctors"><i class="fas fa-user-md"></i> Doctors</a></li>
                
                <li><a href="#testimonials"><i class="fas fa-quote-left"></i> Testimonials</a></li>
                <li><a href="#contact"><i class="fas fa-envelope"></i> Contact</a></li>
                <a href="multirole.html" target="_blank" class="login-btn-nav">Login</a>
            </ul>
        </div>
    </nav>
    
    <!-- Hero Section -->
    <section class="hero">
        <div class="container hero-content">
            <h2>Your Health Is Our Priority</h2>
            <p>Providing exceptional healthcare services with state-of-the-art facilities and compassionate medical professionals dedicated to your well-being.</p>
            <a href="patient-loginpage.html" class="btn">Book an Appointment</a>
        </div>
    </section>
    
    <!-- Quick Links -->
    <section class="quick-links">
        <div class="container">
            <h2>Quick Links</h2>
            <div class="links-grid">
                <div class="link-card">
                    <i class="fas fa-calendar-check"></i>
                    <h3>Book Appointment</h3>
                    <p>Schedule your visit with our specialists</p>
                    <a href="appoint.html" class="btn">Schedule Now</a>
                </div>
                <div class="link-card">
                    <i class="fas fa-map-marker-alt"></i>
                    <h3>Find a Doctor</h3>
                    <p>Search our directory of experienced physicians</p>
                    <a href="#doctors" class="btn">View Doctors</a>
                </div>
                <div class="link-card">
                    <i class="fas fa-pills"></i>
                    <h3>Pharmacy</h3>
                    <p>Refill prescriptions and view medication info</p>
                    <a href="#" class="btn">Pharmacy Info</a>
                </div>
              
            </div>
        </div>
    </section>
    
    <!-- About Us -->
    <section id="about" class="about">
        <div class="container">
            <h2>About Santhéa Hospital</h2>
            <div class="about-grid">
                <div class="about-card">
                    <img src="https://thumbs.dreamstime.com/b/modern-hospital-ward-rows-advanced-medical-beds-bright-interior-clean-design-concept-healthcare-infrastructure-351506587.jpg" alt="Our Facility">
                    <div class="about-content">
                        <h3>Our Facility</h3>
                        <p>State-of-the-art medical center with 300+ beds, advanced diagnostic equipment, and modern treatment facilities.</p>
                        <a href="#" class="btn">Take a Virtual Tour</a>
                    </div>
                </div>
                <div class="about-card">
                    <img src="https://www.buckshealthcare.nhs.uk/wp-content/uploads/2021/10/vision-mission-values.jpg" alt="Mission & Values">
                    <div class="about-content">
                        <h3>Mission & Values</h3>
                        <p>Committed to providing compassionate, high-quality healthcare to all members of our community.</p>
                        <a href="#" class="btn">Learn More</a>
                    </div>
                </div>
                <div class="about-card">
                    <img src="https://photos.healthgrades.com/hospital-quality/generic/lg/PSAFE-166px.png" alt="Accreditations">
                    <div class="about-content">
                        <h3>Accreditations</h3>
                        <p>Fully accredited by JCI with awards for patient safety and quality care excellence.</p>
                        <a href="#" class="btn">View Certifications</a>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Services -->
    <section id="services" class="services">
        <div class="container">
            <h2>Our Medical Services</h2>
            <div class="services-grid">
                <div class="service-card">
                    <img src="https://e1.pxfuel.com/desktop-wallpaper/313/969/desktop-wallpaper-emergency-fire-alarms.jpg" alt="Emergency Service">
                    <div class="service-content">
                        <h3>Emergency Care</h3>
                        <p>24/7 emergency services with rapid response teams and state-of-the-art trauma centers.</p>
                        <a href="emergency.html">Learn More <i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>
                <div class="service-card">
                    <img src="https://media.gettyimages.com/id/1530491709/photo/doctor-touching-heart-icon-for-treatment-and-healthcare-of-technology-digital-futuristic.jpg?s=612x612&w=0&k=20&c=bIaD3qePYF9-MpppoeYWJ0PRhOz0TalF-0P5JwP-LIg=" alt="Cardiology Service">
                    <div class="service-content">
                        <h3>Cardiology</h3>
                        <p>Comprehensive heart care including diagnostics, treatment, and rehabilitation.</p>
                        <a href="#">Learn More <i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>
                <div class="service-card">
                    <img src="https://www.asterhospitals.in/sites/default/files/2022-10/Paediatrics%20%26%20Neonatology.png" alt="Pediatrics Service">
                    <div class="service-content">
                        <h3>Pediatrics</h3>
                        <p>Specialized care for infants, children, and adolescents in a child-friendly environment.</p>
                        <a href="#">Learn More <i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <a href="#" class="btn">View All Services</a>
            </div>
        </div>
    </section>
    
    <!-- Doctors -->
    <section id="doctors" class="doctors">
        <div class="container">
            <h2>Our Medical Specialists</h2>
            <div class="doctors-grid">
                <div class="doctor-card">
                    <img src="https://myaocconnect.com/wp-content/uploads/AOC-Connect-Sandy-Emery-headshot.jpg" alt="Dr. Sarah Johnson">
                    <div class="doctor-info">
                        <h3>Dr. Sarah Johnson</h3>
                        <p>Cardiologist</p>
                        <p>MD, FACC</p>
                        <a href="#" class="btn">View Profile</a>
                    </div>
                </div>
                <div class="doctor-card">
                    <img src="https://th.bing.com/th/id/OIP.saY5csibW4F6hDMOwYcjtAHaFj?w=230&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7" alt="Dr. Michael Chen">
                    <div class="doctor-info">
                        <h3>Dr. Michael Chen</h3>
                        <p>Neurologist</p>
                        <p>MD, PhD</p>
                        <a href="#" class="btn">View Profile</a>
                    </div>
                </div>
                <div class="doctor-card">
                    <img src="https://th.bing.com/th/id/OIP.kQQM0JyMfwUMsSkSyU3v2gHaHa?w=168&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7" alt="Dr. Priya Patel">
                    <div class="doctor-info">
                        <h3>Dr. Priya Patel</h3>
                        <p>Pediatrician</p>
                        <p>MD, FAAP</p>
                        <a href="#" class="btn">View Profile</a>
                    </div>
                </div>
                <div class="doctor-card">
                    <img src="https://doximity-res.cloudinary.com/images/f_auto,q_auto,t_profile_photo_320x320/leipfgnnq8ykyanlroaz/robert-williams-md-aurora-co.jpg" alt="Dr. Robert Williams">
                    <div class="doctor-info">
                        <h3>Dr. Robert Williams</h3>
                        <p>Orthopedic Surgeon</p>
                        <p>MD, FACS</p>
                        <a href="#" class="btn">View Profile</a>
                    </div>
                </div>
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <a href="#" class="btn">Meet All Our Doctors</a>
            </div>
        </div>
    </section>
    
    
    
    <!-- Testimonials -->
    <section id="testimonials" class="testimonials">
        <div class="container">
            <h2>Patient Testimonials</h2>
            <div class="testimonial-grid">
                <div class="testimonial-card">
                    <p>"The care I received at MediCare was exceptional. The doctors took time to listen and explain everything clearly. Highly recommended!"</p>
                    <div class="patient-info">
                        
                        <div>
                            <h4>John D.</h4>
                            <p>Cardiac Patient</p>
                            <div class="rating">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="testimonial-card">
                    <p>"From the moment I walked in, I felt cared for. The nursing staff was attentive and compassionate throughout my stay."</p>
                    <div class="patient-info">
                        
                        
                        <div>
                            <h4>Maria G.</h4>
                            <p>Maternity Patient</p>
                            <div class="rating">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="testimonial-card">
                    <p>"The pediatric team was wonderful with my daughter. They made her feel comfortable during a difficult time. Thank you!"</p>
                    <div class="patient-info">
                        
                        
                        <div>
                            <h4>David and Emily T.</h4>
                            <p>Parents of Pediatric Patient</p>
                            <div class="rating">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star-half-alt"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <a href="#" class="btn">Read More Testimonials</a>
            </div>
        </div>
    </section>
    
    <!-- Contact -->
    <section id="contact" class="contact" style="background-color: #f5f5f5;">
        <div class="container">
            <h2>Contact Us</h2>
            <div class="contact-grid">
                <div class="contact-card">
                    <i class="fas fa-map-marker-alt"></i>
                    <h3>Location</h3>
                    <p>123 Medical Drive<br>Healthville, HV 12345<br>United States</p>
                    <a href="#" class="btn">Get Directions</a>
                </div>
                <div class="contact-card">
                    <i class="fas fa-phone-alt"></i>
                    <h3>Contact Information</h3>
                    <p><strong>Main:</strong> (555) 123-4567<br>
                    <strong>Emergency:</strong> 911<br>
                    <strong>Email:</strong> info@medicarehospital.com</p>
                    <a href="contpagepatient.html" class="btn">Contact Form</a>
                </div>
                <div class="contact-card">
                    <i class="fas fa-clock"></i>
                    <h3>Hours of Operation</h3>
                    <p><strong>Emergency:</strong> 24/7<br>
                    <strong>Outpatient:</strong> Mon-Fri, 8am-8pm<br>
                    <strong>Weekends:</strong> 9am-5pm</p>
                    <a href="#" class="btn">View Full Schedule</a>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Footer -->
    <footer>
        <div class="container">
            <div class="footer-grid">
                <div class="footer-column">
                    <h3>About Us</h3>
                    <ul>
                        <li><a href="#">Our Mission</a></li>
                        <li><a href="#">Leadership</a></li>
                        <li><a href="#">Accreditations</a></li>
                        <li><a href="#">Careers</a></li>
                        <li><a href="#">Volunteer</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h3>Services</h3>
                    <ul>
                        <li><a href="#">Emergency Care</a></li>
                        <li><a href="#">Surgery</a></li>
                        <li><a href="#">Maternity</a></li>
                        <li><a href="#">Imaging</a></li>
                        <li><a href="#">Rehabilitation</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h3>For Patients</h3>
                    <ul>
                        <li><a href="#">Patient Portal</a></li>
                        <li><a href="#">Billing</a></li>
                        <li><a href="#">Medical Records</a></li>
                        <li><a href="#">Visitor Information</a></li>
                        <li><a href="#">Patient Education</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h3>Connect With Us</h3>
                    <div class="contact-info">
                        <p><i class="fas fa-map-marker-alt"></i> 123 Medical Drive, Healthville, HV 12345</p>
                        <p><i class="fas fa-phone-alt"></i> Main: (555) 123-4567</p>
                        <p><i class="fas fa-envelope"></i> info@medicarehospital.com</p>
                        <div class="social-links">
                            <a href="#"><i class="fab fa-facebook"></i></a>
                            <a href="#"><i class="fab fa-twitter"></i></a>
                            <a href="#"><i class="fab fa-instagram"></i></a>
                            <a href="#"><i class="fab fa-linkedin"></i></a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="copyright">
                <p>&copy; 2023 MediCare General Hospital. All Rights Reserved. | <a href="#">Privacy Policy</a> | <a href="#">Terms of Use</a> | <a href="#">Accessibility</a></p>
            </div>
        </div>
    </footer>
</body>
</html>`,  // Your homepage HTML
  
  multirole: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Healthcare System Portal</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        /* Base Styles */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #2c3e50;
            line-height: 1.6;
        }
        
        /* Container */
        .portal-container {
            max-width: 800px;
            width: 90%;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            display: grid;
            grid-template-columns: 1fr 1fr;
            animation: fadeIn 0.5s ease;
        }
        
        /* Welcome Section */
        .welcome-section {
            background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
            color: white;
            padding: 40px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            text-align: center;
        }
        
        .welcome-section h1 {
            font-size: 2rem;
            margin-bottom: 20px;
        }
        
        .welcome-section p {
            margin-bottom: 30px;
            opacity: 0.9;
        }
        
        .welcome-section img {
            width: 150px;
            margin: 0 auto 30px;
        }
        
        /* Login Options */
        .login-options {
            padding: 40px;
        }
        
        .login-options h2 {
            text-align: center;
            margin-bottom: 30px;
            color: #2c3e50;
            font-size: 1.8rem;
        }
        
        .role-btn {
            display: block;
            width: 100%;
            padding: 15px;
            margin-bottom: 15px;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: center;
            text-decoration: none;
        }
        
        .role-btn i {
            margin-right: 10px;
        }
        
        .patient-btn {
            background: #3498db;
            color: white;
        }
        
        .patient-btn:hover {
            background: #2980b9;
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(41, 128, 185, 0.3);
        }
        
        .admin-btn {
            background: #3498db;
            color: white;
        }
        
        .admin-btn:hover {
            background: #2980b9;
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(41, 128, 185, 0.3);
        }
        
        .doctor-btn {
            background: #2ecc71;
            color: white;
        }
        
        .doctor-btn:hover {
            background: #27ae60;
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(46, 204, 113, 0.3);
        }
        
        /* Footer */
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 0.9rem;
            color: #7f8c8d;
        }
        
        /* Animations */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .portal-container {
                grid-template-columns: 1fr;
                width: 95%;
            }
            
            .welcome-section {
                padding: 30px 20px;
            }
            
            .login-options {
                padding: 30px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="portal-container">
        <div class="welcome-section">
            <img src="https://cdn-icons-png.flaticon.com/512/2001/2001819.png" alt="Healthcare Icon">
            <h1>Welcome to Healthcare Pro</h1>
            <p>Comprehensive healthcare management system for administrators and medical professionals</p>
        </div>
        
        <div class="login-options">
            <h2>Select Your Role</h2>
            
            <!-- Role Selection Buttons - Now using anchor tags for native new tab behavior -->
            <a href="patient-loginpage.html" target="_self" class="role-btn patient-btn">
                <i class="fas fa-user-injured"></i> Patient Login
            </a>
            
            <a href="doctor-login.html" target="_top" class="role-btn doctor-btn">
                <i class="fas fa-user-md"></i> Doctor Login
            </a>
            
            <a href="admin-login.html" target="_parent" class="role-btn admin-btn">
                <i class="fas fa-user-shield"></i> Admin Login
            </a>
            
            <div class="footer">
                <p>Need help? Contact support@healthcarepro.com</p>
            </div>
        </div>
    </div>

    <!-- Alternative JavaScript approach (commented out) -->
   
    <script>
        // Function to handle role selection with new tab
        function selectRole(role) {
            // Store the selected role in session storage
            sessionStorage.setItem('userRole', role);
            
            // Open login page in new tab
            const loginPages = {
                'patient': 'patient-login.html',
                'doctor': 'doctor-login.html',
                'admin': 'admin-login.html'
            };
            window.open(loginPages[role], '_blank');
        }
    </script>
   
</body>
</html>`, // Your multirole HTML
  
  patient: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MediCare Hospital - Patient Login</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        /* Global Styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Arial', sans-serif;
        }
        
        body {
            background-color: #f5f7fa;
            color: #333;
            line-height: 1.6;
        }
        
        .container {
            width: 90%;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        /* Header Styles */
        header {
            background-color: #0066cc;
            color: white;
            padding: 1rem 0;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            display: flex;
            align-items: center;
        }
        
        .logo img {
            height: 50px;
            margin-right: 15px;
        }
        
        .logo-text h1 {
            font-size: 1.5rem;
            margin-bottom: 5px;
        }
        
        .logo-text p {
            font-size: 0.8rem;
            opacity: 0.9;
        }
        
        /* Main Content */
        .login-container {
            display: flex;
            min-height: calc(100vh - 120px);
            align-items: center;
            justify-content: center;
            padding: 40px 0;
        }
        
        .login-wrapper {
            display: flex;
            max-width: 1000px;
            width: 100%;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .login-image {
            flex: 1;
            background-image: linear-gradient(rgba(0, 102, 204, 0.8), rgba(0, 102, 204, 0.8)), 
                              url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');
            background-size: cover;
            background-position: center;
            color: white;
            padding: 40px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .login-image h2 {
            font-size: 2rem;
            margin-bottom: 20px;
        }
        
        .login-image p {
            margin-bottom: 30px;
        }
        
        .login-features {
            list-style: none;
        }
        
        .login-features li {
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        
        .login-features i {
            margin-right: 10px;
            font-size: 1.2rem;
            color: #ffcc00;
        }
        
        .login-form {
            flex: 1;
            padding: 50px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .login-form h2 {
            color: #0066cc;
            margin-bottom: 30px;
            text-align: center;
            font-size: 1.8rem;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #555;
        }
        
        .form-group input {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 1rem;
            transition: border-color 0.3s;
        }
        
        .form-group input:focus {
            border-color: #0066cc;
            outline: none;
        }
        
        .password-wrapper {
            position: relative;
        }
        
        .password-toggle {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            color: #777;
        }
        
        .remember-forgot {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .remember-me {
            display: flex;
            align-items: center;
        }
        
        .remember-me input {
            margin-right: 8px;
        }
        
        .forgot-password {
            color: #0066cc;
            text-decoration: none;
            font-size: 0.9rem;
        }
        
        .forgot-password:hover {
            text-decoration: underline;
        }
        
        .btn {
            display: inline-block;
            background-color: #0066cc;
            color: white;
            padding: 12px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            text-align: center;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            transition: background-color 0.3s;
            width: 100%;
        }
        
        .btn:hover {
            background-color: #004d99;
        }
        
        .btn-google {
            background-color: white;
            color: #555;
            border: 1px solid #ddd;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 15px;
        }
        
        .btn-google:hover {
            background-color: #f5f5f5;
        }
        
        .btn-google i {
            margin-right: 10px;
            font-size: 1.2rem;
            color: #db4437;
        }
        
        .register-link {
            text-align: center;
            margin-top: 20px;
            color: #555;
        }
        
        .register-link a {
            color: #0066cc;
            text-decoration: none;
            font-weight: 500;
        }
        
        .register-link a:hover {
            text-decoration: underline;
        }
        
        /* Footer */
        footer {
            background-color: #003366;
            color: white;
            padding: 20px 0;
            text-align: center;
            font-size: 0.9rem;
        }
        
        .footer-links {
            margin-bottom: 10px;
        }
        
        .footer-links a {
            color: white;
            text-decoration: none;
            margin: 0 10px;
        }
        
        .footer-links a:hover {
            text-decoration: underline;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .login-wrapper {
                flex-direction: column;
            }
            
            .login-image {
                display: none;
            }
            
            .login-form {
                padding: 30px;
            }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header>
        <div class="container header-top">
            <div class="logo">
                <img src="https://via.placeholder.com/50x50" alt="MediCare Hospital Logo">
                <div class="logo-text">
                    <h1>MediCare General Hospital</h1>
                    <p>Patient Portal Login</p>
                </div>
            </div>
        </div>
    </header>
    
    <!-- Main Content -->
    <main class="login-container">
        <div class="container">
            <div class="login-wrapper">
                <div class="login-image">
                    <h2>Welcome to Patient Portal</h2>
                    <p>Access your medical records, schedule appointments, and communicate with your healthcare team.</p>
                    <ul class="login-features">
                        <li><i class="fas fa-check-circle"></i> View test results and medical history</li>
                        <li><i class="fas fa-check-circle"></i> Request prescription refills</li>
                        <li><i class="fas fa-check-circle"></i> Securely message your doctor</li>
                        <li><i class="fas fa-check-circle"></i> Manage upcoming appointments</li>
                        <li><i class="fas fa-check-circle"></i> Pay bills online</li>
                    </ul>
                </div>
                <div class="login-form">
                    <h2>Patient Login</h2>
                    <form action="#" method="POST">
                        <div class="form-group">
                            <label for="username">Username or Email</label>
                            <input type="text" id="username" name="username" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <div class="password-wrapper">
                                <input type="password" id="password" name="password" required>
                                <i class="fas fa-eye password-toggle" id="togglePassword"></i>
                            </div>
                        </div>
                        <div class="remember-forgot">
                            <div class="remember-me">
                                <input type="checkbox" id="remember" name="remember">
                                <label for="remember">Remember me</label>
                            </div>
                            <a href="forgot-password.html" class="forgot-password">Forgot password?</a>
                        </div>
                        <button type="submit" class="btn">Login</button>
                        <button type="button" class="btn btn-google">
                            <i class="fab fa-google"></i> Sign in with Google
                        </button>
                    </form>
                    <div class="register-link">
                        Don't have an account? <a href="register.html">Register here</a>
                    </div>
                </div>
            </div>
        </div>
    </main>
    
    <!-- Footer -->
    <footer>
        <div class="container">
            <div class="footer-links">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Use</a>
                <a href="#">Contact Us</a>
                <a href="#">Help</a>
            </div>
            <p>&copy; 2023 MediCare General Hospital. All Rights Reserved.</p>
        </div>
    </footer>

    <script>
        // Toggle password visibility
        const togglePassword = document.querySelector('#togglePassword');
        const password = document.querySelector('#password');
        
        togglePassword.addEventListener('click', function() {
            const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
            password.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
        });
        
        // Simple form validation
        document.querySelector('form').addEventListener('submit', function(e) {
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            
            if (!username || !password) {
                e.preventDefault();
                alert('Please fill in all fields');
            }
        });
    </script>
</body>
</html>`,

// admin loginpage
admin:`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MediCare Hospital - Admin Login</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        /* Global Styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Arial', sans-serif;
        }
        
        body {
            background-color: #f5f7fa;
            color: #333;
            line-height: 1.6;
        }
        
        .container {
            width: 90%;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        /* Header Styles */
        header {
            background-color: #0066cc;
            color: white;
            padding: 1rem 0;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            display: flex;
            align-items: center;
        }
        
        .logo img {
            height: 50px;
            margin-right: 15px;
        }
        
        .logo-text h1 {
            font-size: 1.5rem;
            margin-bottom: 5px;
        }
        
        .logo-text p {
            font-size: 0.8rem;
            opacity: 0.9;
        }
        
        /* Main Content */
        .login-container {
            display: flex;
            min-height: calc(100vh - 120px);
            align-items: center;
            justify-content: center;
            padding: 40px 0;
        }
        
        .login-wrapper {
            display: flex;
            max-width: 1000px;
            width: 100%;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .login-image {
            flex: 1;
            background-image: linear-gradient(rgba(0, 102, 204, 0.8), rgba(0, 102, 204, 0.8)), 
                              url('https://images.unsplash.com/photo-1551601651-bc60f254d532?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');
            background-size: cover;
            background-position: center;
            color: white;
            padding: 40px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .login-image h2 {
            font-size: 2rem;
            margin-bottom: 20px;
        }
        
        .login-image p {
            margin-bottom: 30px;
        }
        
        .login-features {
            list-style: none;
        }
        
        .login-features li {
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        
        .login-features i {
            margin-right: 10px;
            font-size: 1.2rem;
            color: #ffcc00;
        }
        
        .login-form {
            flex: 1;
            padding: 50px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .login-form h2 {
            color: #0066cc;
            margin-bottom: 30px;
            text-align: center;
            font-size: 1.8rem;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #555;
        }
        
        .form-group input {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 1rem;
            transition: border-color 0.3s;
        }
        
        .form-group input:focus {
            border-color: #0066cc;
            outline: none;
        }
        
        .password-wrapper {
            position: relative;
        }
        
        .password-toggle {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            color: #777;
        }
        
        .remember-forgot {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .remember-me {
            display: flex;
            align-items: center;
        }
        
        .remember-me input {
            margin-right: 8px;
        }
        
        .forgot-password {
            color: #0066cc;
            text-decoration: none;
            font-size: 0.9rem;
        }
        
        .forgot-password:hover {
            text-decoration: underline;
        }
        
        .btn {
            display: inline-block;
            background-color: #0066cc;
            color: white;
            padding: 12px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            text-align: center;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            transition: background-color 0.3s;
            width: 100%;
        }
        
        .btn:hover {
            background-color: #004d99;
        }
        
        /* Footer */
        footer {
            background-color: #003366;
            color: white;
            padding: 20px 0;
            text-align: center;
            font-size: 0.9rem;
        }
        
        .footer-links {
            margin-bottom: 10px;
        }
        
        .footer-links a {
            color: white;
            text-decoration: none;
            margin: 0 10px;
        }
        
        .footer-links a:hover {
            text-decoration: underline;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .login-wrapper {
                flex-direction: column;
            }
            
            .login-image {
                display: none;
            }
            
            .login-form {
                padding: 30px;
            }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header>
        <div class="container header-top">
            <div class="logo">
                <img src="https://via.placeholder.com/50x50" alt="MediCare Hospital Logo">
                <div class="logo-text">
                    <h1>MediCare General Hospital</h1>
                    <p>Administrator Portal Login</p>
                </div>
            </div>
        </div>
    </header>
    
    <!-- Main Content -->
    <main class="login-container">
        <div class="container">
            <div class="login-wrapper">
                <div class="login-image">
                    <h2>Welcome to Admin Portal</h2>
                    <p>Manage hospital operations, staff, and patient data through our comprehensive administration system.</p>
                    <ul class="login-features">
                        <li><i class="fas fa-check-circle"></i> Manage hospital staff and user accounts</li>
                        <li><i class="fas fa-check-circle"></i> Oversee patient records and data</li>
                        <li><i class="fas fa-check-circle"></i> Generate reports and analytics</li>
                        <li><i class="fas fa-check-circle"></i> Configure system settings</li>
                        <li><i class="fas fa-check-circle"></i> Monitor hospital operations</li>
                    </ul>
                </div>
                <div class="login-form">
                    <h2>Admin Login</h2>
                    <form action="#" method="POST">
                        <div class="form-group">
                            <label for="username">Admin ID</label>
                            <input type="text" id="username" name="username" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <div class="password-wrapper">
                                <input type="password" id="password" name="password" required>
                                <i class="fas fa-eye password-toggle" id="togglePassword"></i>
                            </div>
                        </div>
                        <div class="remember-forgot">
                            <div class="remember-me">
                                <input type="checkbox" id="remember" name="remember">
                                <label for="remember">Remember me</label>
                            </div>
                            <a href="forgot-password.html" class="forgot-password">Forgot password?</a>
                        </div>
                        <button type="submit" class="btn">Login</button>
                    </form>
                </div>
            </div>
        </div>
    </main>
    
    <!-- Footer -->
    <footer>
        <div class="container">
            <div class="footer-links">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Use</a>
                <a href="#">Contact Us</a>
                <a href="#">Help</a>
            </div>
            <p>&copy; 2023 MediCare General Hospital. All Rights Reserved.</p>
        </div>
    </footer>

    <script>
        // Toggle password visibility
        const togglePassword = document.querySelector('#togglePassword');
        const password = document.querySelector('#password');
        
        togglePassword.addEventListener('click', function() {
            const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
            password.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
        });
        
        // Simple form validation
        document.querySelector('form').addEventListener('submit', function(e) {
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            
            if (!username || !password) {
                e.preventDefault();
                alert('Please fill in all fields');
            }
        });
    </script>
</body>
</html>`,
///doctor 
doctor:`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MediCare Hospital - Doctor Login</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        /* Global Styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Arial', sans-serif;
        }
        
        body {
            background-color: #f5f7fa;
            color: #333;
            line-height: 1.6;
        }
        
        .container {
            width: 90%;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        /* Header Styles */
        header {
            background-color: #0066cc;
            color: white;
            padding: 1rem 0;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            display: flex;
            align-items: center;
        }
        
        .logo img {
            height: 50px;
            margin-right: 15px;
        }
        
        .logo-text h1 {
            font-size: 1.5rem;
            margin-bottom: 5px;
        }
        
        .logo-text p {
            font-size: 0.8rem;
            opacity: 0.9;
        }
        
        /* Main Content */
        .login-container {
            display: flex;
            min-height: calc(100vh - 120px);
            align-items: center;
            justify-content: center;
            padding: 40px 0;
        }
        
        .login-wrapper {
            display: flex;
            max-width: 1000px;
            width: 100%;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .login-image {
            flex: 1;
            background-image: linear-gradient(rgba(0, 102, 204, 0.8), rgba(0, 102, 204, 0.8)), 
                              url('https://images.unsplash.com/photo-1581595219315-a187dd40c322?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');
            background-size: cover;
            background-position: center;
            color: white;
            padding: 40px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .login-image h2 {
            font-size: 2rem;
            margin-bottom: 20px;
        }
        
        .login-image p {
            margin-bottom: 30px;
        }
        
        .login-features {
            list-style: none;
        }
        
        .login-features li {
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        
        .login-features i {
            margin-right: 10px;
            font-size: 1.2rem;
            color: #ffcc00;
        }
        
        .login-form {
            flex: 1;
            padding: 50px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .login-form h2 {
            color: #0066cc;
            margin-bottom: 30px;
            text-align: center;
            font-size: 1.8rem;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #555;
        }
        
        .form-group input {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 1rem;
            transition: border-color 0.3s;
        }
        
        .form-group input:focus {
            border-color: #0066cc;
            outline: none;
        }
        
        .password-wrapper {
            position: relative;
        }
        
        .password-toggle {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            color: #777;
        }
        
        .remember-forgot {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .remember-me {
            display: flex;
            align-items: center;
        }
        
        .remember-me input {
            margin-right: 8px;
        }
        
        .forgot-password {
            color: #0066cc;
            text-decoration: none;
            font-size: 0.9rem;
        }
        
        .forgot-password:hover {
            text-decoration: underline;
        }
        
        .btn {
            display: inline-block;
            background-color: #0066cc;
            color: white;
            padding: 12px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            text-align: center;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            transition: background-color 0.3s;
            width: 100%;
        }
        
        .btn:hover {
            background-color: #004d99;
        }
        
        /* Footer */
        footer {
            background-color: #003366;
            color: white;
            padding: 20px 0;
            text-align: center;
            font-size: 0.9rem;
        }
        
        .footer-links {
            margin-bottom: 10px;
        }
        
        .footer-links a {
            color: white;
            text-decoration: none;
            margin: 0 10px;
        }
        
        .footer-links a:hover {
            text-decoration: underline;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .login-wrapper {
                flex-direction: column;
            }
            
            .login-image {
                display: none;
            }
            
            .login-form {
                padding: 30px;
            }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header>
        <div class="container header-top">
            <div class="logo">
                <img src="https://via.placeholder.com/50x50" alt="MediCare Hospital Logo">
                <div class="logo-text">
                    <h1>MediCare General Hospital</h1>
                    <p>Doctor Portal Login</p>
                </div>
            </div>
        </div>
    </header>
    
    <!-- Main Content -->
    <main class="login-container">
        <div class="container">
            <div class="login-wrapper">
                <div class="login-image">
                    <h2>Welcome to Doctor Portal</h2>
                    <p>Access patient records, manage appointments, and provide quality care through our secure portal.</p>
                    <ul class="login-features">
                        <li><i class="fas fa-check-circle"></i> Access complete patient medical histories</li>
                        <li><i class="fas fa-check-circle"></i> Review and update treatment plans</li>
                        <li><i class="fas fa-check-circle"></i> Securely communicate with patients</li>
                        <li><i class="fas fa-check-circle"></i> Manage your appointment schedule</li>
                        <li><i class="fas fa-check-circle"></i> Submit prescriptions electronically</li>
                    </ul>
                </div>
                <div class="login-form">
                    <h2>Doctor Login</h2>
                    <form action="#" method="POST">
                        <div class="form-group">
                            <label for="username">Doctor ID or Email</label>
                            <input type="text" id="username" name="username" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <div class="password-wrapper">
                                <input type="password" id="password" name="password" required>
                                <i class="fas fa-eye password-toggle" id="togglePassword"></i>
                            </div>
                        </div>
                        <div class="remember-forgot">
                            <div class="remember-me">
                                <input type="checkbox" id="remember" name="remember">
                                <label for="remember">Remember me</label>
                            </div>
                            <a href="forgot-password.html" class="forgot-password">Forgot password?</a>
                        </div>
                        <button type="submit" class="btn">Login</button>
                    </form>
                </div>
            </div>
        </div>
    </main>
    
    <!-- Footer -->
    <footer>
        <div class="container">
            <div class="footer-links">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Use</a>
                <a href="#">Contact Us</a>
                <a href="#">Help</a>
            </div>
            <p>&copy; 2023 MediCare General Hospital. All Rights Reserved.</p>
        </div>
    </footer>

    <script>
        // Toggle password visibility
        const togglePassword = document.querySelector('#togglePassword');
        const password = document.querySelector('#password');
        
        togglePassword.addEventListener('click', function() {
            const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
            password.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
        });
        
        // Simple form validation
        document.querySelector('form').addEventListener('submit', function(e) {
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            
            if (!username || !password) {
                e.preventDefault();
                alert('Please fill in all fields');
            }
        });
    </script>
</body>
</html>`
};

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  res.setHeader('Content-Type', 'text/html');

  // Handle routes
  if (req.url === '/' || req.url === '/index.html') {
    res.statusCode = 200;
    res.end(templates.homepage);
  } 
  else if (req.url === '/multirole' || req.url === '/multirole.html') {
    res.statusCode = 200;
    res.end(templates.multirole);
  }
  else if (req.url === '/patient-loginpage' || req.url === '/patient-loginpage.html') {
    res.statusCode = 200;
    res.end(templates.patient);
  }
  else if (req.url === '/admin-login' || req.url === '/admin-login.html') {
    res.statusCode = 200;
    res.end(templates.admin);
  }
  else if (req.url === '/doctor-login' || req.url === '/doctor-login.html') {
    res.statusCode = 200;
    res.end(templates.doctor);
  }
  else {
    res.statusCode = 404;
    res.end('<h1>404 Not Found</h1>');
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});