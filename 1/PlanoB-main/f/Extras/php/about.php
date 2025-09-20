<?php 

    // session_start();

    // if (!isset($_SESSION['username'])) { 
    //     header("Location: index.php"); 
    //     exit();
    // }

    
    // if(isset($_POST['logout'])){
    //     session_destroy();
    //     header("Location: ../php/index.php");

    // }

?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet"> <!-- FontAwesome Icons -->
    <link rel="stylesheet" href="../css/styles.css"> <!-- Link to your custom CSS -->
    <title>FarmSafe - About Us</title>
</head>

<body>
    <!-- Navigation Bar -->
    <header>
        <nav class="navbar navbar-expand-lg fixed-top">
            <div class="container-fluid">
                <a class="navbar-brand logo me-auto" href="#">FarmSafe</a>
                <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasNavbar"
                    aria-labelledby="offcanvasNavbarLabel">
                    <div class="offcanvas-header">
                        <h5 class="offcanvas-title logo" id="offcanvasNavbarLabel">FarmSafe</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                    <div class="offcanvas-body">
                        <ul class="navbar-nav justify-content-center flex-grow-1 pe-3">
                            <li class="nav-item me-3">
                                <a class="nav-link mx-lg-z content-font2" aria-current="page"
                                    href="home.php">Home</a>
                            </li>
                            <li class="nav-item me-3">
                                <a class="nav-link mx-lg-z  content-font2" aria-current="page" href="resources.php">Library</a>
                            </li>
                            <li class="nav-item me-3">
                                <a class="nav-link mx-lg-z  content-font2" aria-current="page" href="vaccination.php">Vaccination</a>
                            </li>
                            <li class="nav-item me-3">
                                <a class="nav-link mx-lg-z content-font2" aria-current="page" href="disease-info.php">Disease</a>
                            </li>
                            <li class="nav-item me-3">
                                <a class="nav-link mx-lg-z  content-font2" aria-current="page" href="report-disease.php">Report</a>
                            </li>
                            <li class="nav-item me-3">
                                <a class="nav-link mx-lg-z  content-font2" aria-current="page" href="Forum.php">Forum</a>
                            </li>
                            <li class="nav-item me-3">
                                <a class="nav-link active mx-lg-z content-font2" href="about.php">About</a>
                            </li>
                        </ul>
                    </div>
                </div>
                <form action="about.php" method="POST"><input class="login-button content-font2" style="border: solid 0px;" type="submit" name="logout" value="LogOut"></input></form>
                <button class="navbar-toggler pe-0" type="button" data-bs-toggle="offcanvas"
                    data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
            </div>
        </nav>
    </header>

    <!-- About Section -->
    <section class='about-us mt-5 pt-5'>
        <div class='container' style="padding-top: 50px; padding-bottom: 80px;">
            <!-- About Us Heading -->
            <h2 class='text-center' style="font-size: 4em; margin-bottom: 40px; font-family: Playwrite GB S, cursive;;">ABOUT US</h2>

            <!-- Mission and Vision Section -->
            <div class='row'>
                <!-- Mission Column -->
                <div class='col-lg-6'>
                    <h3>Our Mission</h3>
                    Our mission is to empower livestock owners with the knowledge and resources they need to prevent and manage diseases effectively. By providing valuable insights and practical tools, we aim to improve livestock health and productivity globally.
                </div>

                <!-- Vision Column -->
                <div class='col-lg-6'>
                    <h3>Our Vision</h3>
                    We envision a world with a healthy livestock population, supported by informed management practices and timely interventions. Our goal is to foster a community of knowledgeable individuals dedicated to sustainable livestock health.
                </div>

            </div>

            <!-- Objectives Section -->
            <div class='row mt-5'>
                <!-- Objectives Column -->
                <div class='col-lg-12'>
                    <h3>Our Objectives</h3>
                    <ul>
                        <li>Provide reliable information on common and emerging livestock diseases.</li>
                        <li>Facilitate timely vaccination schedules and updates.</li>
                        <li>Create a supportive community for sharing knowledge, experiences, and resources.</li>
                        <li>Encourage and promote best practices in livestock health management across all sectors.</li>
                    </ul>
                </div>

            </div>

        </div> <!-- End of container -->
    </section>

    <!-- Footer Section -->
    <footer class='bg-dark text-white pt-5 pb-4'>

        <!-- Footer Content -->
        <div class='container text-left text-md-left'>
            <!-- Footer Row -->
            <div class='row text-left text-md-left'>

                <!-- FarmSafe Info -->
                <div class='col-md-3 col-lg-3 col-xl-3 mx-auto mt-3'>
                    <!-- Company Name -->
                    FarmSafe

                    Explore detailed disease guides, track vaccination schedules, report outbreaks, and join a
                    community forum designed for farmers, veterinarians, and agricultural students to promote
                    healthier livestock management.
                    </p>
                </div>
                <div class="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
                    <h5>Links</h5>
                    <p>
                        <a class="text-white" style="text-decoration: none;" href="#">Forum</a>
                    </p>
                    <p>
                        <a class="text-white" style="text-decoration: none;" href="#">Report</a>
                    </p>
                    <p>
                        <a class="text-white" style="text-decoration: none;" href="#">About</a>
                    </p>
                    <p>
                        <a class="text-white" style="text-decoration: none;" href="#">Article</a>
                    </p>
                </div>

                <div class="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
                    <h5>Contact</h5>
                    <p>
                        <i class="fas fa-home mr-3"> Windhoek, NUST, Namibia</i><br>
                        <i class="fas fa-envelope mr-3"> farmsafe@gmail.com</i><br>
                        <i class="fas fa-phone mr-3">+264 200 000</i><br>
                        <i class="fas fa-print mr-3">+264 300 000</i>
                    </p>
                </div>
            </div>
            <hr class="mb-4">
            <div class="row align-items-center">
                <div class="col-md-7 col-lg-8">
                    <p>Copyrights ©2024 All rights reserved by: <strong
                            style="font-family: Playwrite GB S, cursive;">FarmSafe</strong></p>
                </div>
            </div>
        </div>

    </footer>
    <script src="../js/script.js"></script> <!-- Link to JavaScript file -->
    <script src='https://code.jquery.com/jquery-3.5.1.slim.min.js'></script> <!-- Include jQuery for Bootstrap JS -->
    <script src='https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js'></script>
    <!-- Include Popper.js for Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
        crossorigin="anonymous"></script><!-- Include Bootstrap JS -->
</body>

</html>