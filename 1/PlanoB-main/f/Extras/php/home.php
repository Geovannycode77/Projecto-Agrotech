<?php 

    // session_start();

    // if (!isset($_SESSION['username'])) { 
    //     header("Location: ../php/index.php"); 
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
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet">


    <link rel="stylesheet" href="../../css/styles.css"> <!-- Link to your custom CSS -->
    <title>FarmSafe</title>
</head>

<body>
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
                                <a class="nav-link mx-lg-z active content-font2" aria-current="page"
                                    href="home.php">Home</a>
                            </li>
                            <li class="nav-item me-3">
                                <a class="nav-link mx-lg-z  content-font2" aria-current="page" href="resources.php">Library</a>
                            </li>
                            <li class="nav-item me-3">
                                <a class="nav-link mx-lg-z  content-font2" aria-current="page" href="vaccination.php">Vaccination</a>
                            </li>
                            <li class="nav-item me-3">
                                <a class="nav-link mx-lg-z  content-font2" aria-current="page" href="disease-info.php">Disease</a>
                            </li>
                            <li class="nav-item me-3">
                                <a class="nav-link mx-lg-z  content-font2" aria-current="page" href="report-disease.php">Report</a>
                            </li>
                            <li class="nav-item me-3">
                                <a class="nav-link mx-lg-z  content-font2" aria-current="page" href="Forum.php">Forum</a>
                            </li>
                            <li class="nav-item me-3">
                                <a class="nav-link mx-lg-z content-font2" href="about.php">About</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <form action="home.php" method="POST"><input class="login-button content-font2" style="border: solid 0px;" type="submit" name="logout" value="LogOut"></input></form>

                <button class="navbar-toggler pe-0" type="button" data-bs-toggle="offcanvas"
                    data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
            </div>
        </nav>
    </header>
    <div class="container-fluid home-banner">
        <div class="row">

            <div class="col-12 col-md-6 home-banner-left">
                <p>Let's</p>
                <p style="text-decoration: underline; color: #228B22;">Protect</p>
                <p>Your <span style="text-decoration: underline; color: #36454F;">Livestock</span></p>
            </div>


            <div class="col-12 col-md-6 home-banner-right">
                <div>
                    <p>Explore detailed disease guides, track vaccination schedules, report outbreaks, and join a
                        community
                        forum designed for farmers, veterinarians, and agricultural students to promote healthier
                        livestock
                        management.</p>
                </div>

                <div>
                    <a href="vaccination.php"><button type="button"
                            class="btn btn-primary home-banner-button">Vaccination Schedule</button></a>
                </div>
                <div>
                    <a href="report-disease.php"><button type="button" class="btn btn-primary mt-3 home-banner-button">Report a
                            Disease</button></a>
                </div>
            </div>
        </div>
    </div>
    <main class="container mt-4">
        <h2 class="featured-header">Featured Articles</h2>
        <div class="row card-custom">
            <div class="col-12 col-md-4">
                <a href="https://www.woah.org/en/disease/foot-and-mouth-disease/" target="_blank">
                    <div class="card" style="width: 100%;">
                        <img src="../images/UNADJUSTEDNONRAW_thumb_1b6e.jpg" class="card-img-top" alt="...">
                        <div class="card-body">
                            <h5 class="card-title">Foot and Mouth Disease</h5>
                            <p class="card-text">Highly contagious viral disease affecting cattle, causing fever,
                                blisters on the mouth and feet, and lameness. Learn symptoms, prevention, and management
                                practices to protect your herd.</p>
                        </div>
                    </div>
                </a>
            </div>
            <div class="col-12 col-md-4">
                <a href="https://www.noah.co.uk/wp-content/uploads/2022/08/NOAH-Livestock-Vaccination-Guideline-August-2022.pdf"
                    target="_blank">
                    <div class="card" style="width: 100%;">
                        <img src="../images/images.jpg" alt="...">
                        <div class="card-body">
                            <h5 class="card-title">Vaccination Importance</h5>
                            <p class="card-text">Essential for preventing infectious diseases, vaccinations strengthen
                                livestock immunity, reduce illness, and improve herd productivity. Discover schedules
                                and best practices to safeguard animal health.</p>
                        </div>
                    </div>
                </a>
            </div>
            <div class="col-12 col-md-4">
                <a href="https://vikaspedia.in/agriculture/livestock/general-management-practices-of-livestock/common-animal-diseases-and-their-prevention-and-treatments"
                    target="_blank">
                    <div class="card" style="width: 100%;">
                        <img src="../images/download.jpg" alt="...">
                        <div class="card-body">
                            <h5 class="card-title">Common Livestock Diseases</h5>
                            <p class="card-text">Learn about frequent livestock diseases, key symptoms to monitor, and
                                early detection tips to keep your herd healthy and minimize risks.</p>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    </main>
    <div class="container-fluid mt-4">
        <div class="row text-center">
            <div class="col forum-container">
                <h2>
                    Join our Community Forum
                </h2>
                <a href="forum.php"><button type="button" class="btn btn-primary">Join</button></a>
            </div>
        </div>
    </div>

    <div class="container-fluid">
        <h2 style="font-family: Playwrite GB S, cursive; text-align: center; font-weight: bold; padding-top: 30px;">
            Explore Our Pages
        </h2>
        <div class="row justify-content-center">
            <div class="col-12 col-md-4 mb-4">
                <a href="resources.php" class="link">
                    <div class="card card-custom2" style="padding-bottom: 23px;">
                        <img src="../images/book (1).png" class="card-img-top explore-images" alt="...">
                        <div class="card-body">
                            <h5 class="card-title">Resource Library</h5>
                            <p class="card-text">Find articles, research papers, and guidelines.</p>
                        </div>
                    </div>
                </a>
            </div>
            <div class="col-12 col-md-4 mb-4">
                <a href="disease-info.php" class="link">
                    <div class="card card-custom2">
                        <img src="../images/info.png" class="card-img-top explore-images" alt="...">
                        <div class="card-body">
                            <h5 class="card-title">Disease Info</h5>
                            <p class="card-text">See common livestock diseases, including symptoms, prevention methods, and treatment options.</p>
                        </div>
                    </div>
                </a>
            </div>
            <div class="col-12 col-md-4 mb-4">
                <a href="report-disease.php" class="link">
                    <div class="card card-custom2" style="padding-bottom: 23px;">
                        <img src="../images/more.png" class="card-img-top explore-images" alt="...">
                        <div class="card-body">
                            <h5 class="card-title">Report</h5>
                            <p class="card-text">Help others by reporting a disease outbreak.</p>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    </div>
    

    <footer style="background-color: #132e2e;"  class="text-white pt-5 pb-4">

        <div class="container text-left text-md-left">
            <div  class="row text-left text-md-left">
                <div class="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
                    <h5 class="mb-4 " style="font-family: Playwrite GB S, cursive;">FarmSafe</h5>
                    <p>
                        Explore detailed disease guides, track vaccination schedules, report outbreaks, and join a
                        community forum designed for farmers, veterinarians, and agricultural students to promote
                        healthier livestock management.
                    </p>
                </div>
                <div class="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
                    <h5>Links</h5>
                    <p>
                        <a class="text-white" style="text-decoration: none;" href="forum.php">Forum</a>
                    </p>
                    <p>
                        <a class="text-white" style="text-decoration: none;" href="report-disease.php">Report</a>
                    </p>
                    <p>
                        <a class="text-white" style="text-decoration: none;" href="about.php">About</a>
                    </p>
                    <p>
                        <a class="text-white" style="text-decoration: none;" href="resources.php">Article</a>
                    </p>
                </div>

                <div class="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
                    <h5>Contact</h5>
                    <p>
                        <i class="fas fa-home mr-3"> Windhoek, NUST, Namibia</i> <br>
                        <i class="fas fa-envelope mr-3"> farmsafe@gmail.com</i> <br>
                        <i class="fas fa-phone mr-3">+264 200 000</i> <br>
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