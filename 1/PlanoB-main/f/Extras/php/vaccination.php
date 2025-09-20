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
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet">


    <link rel="stylesheet" href="../css/styles.css"> <!-- Link to your custom CSS -->
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
                                <a class="nav-link mx-lg-z content-font2" aria-current="page"
                                    href="home.php">Home</a>
                            </li>
                            <li class="nav-item me-3">
                                <a class="nav-link mx-lg-z  content-font2" aria-current="page" href="resources.php">Library</a>
                            </li>
                            <li class="nav-item me-3">
                                <a class="nav-link active mx-lg-z  content-font2" aria-current="page" href="vaccination.php">Vaccination</a>
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
                <form action="vaccination.php" method="POST"><input class="login-button content-font2" style="border: solid 0px;" type="submit" name="logout" value="LogOut"></input></form>
                <button class="navbar-toggler pe-0" type="button" data-bs-toggle="offcanvas"
                    data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
            </div>
        </nav>
    </header>

    <main class='container'>
        <div class='main-content' style="margin-top: 110px;">
            <h1>Vaccination Schedules</h1>

            <!-- Vaccination Schedule Table -->
            <table class='table table-bordered'>
                <thead>
                    <tr>
                        <th>Animal Type</th>
                        <th>Vaccine Name</th>
                        <th>Age for Vaccination (Months)</th>
                        <th>Frequency (Years)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Cattle</td>
                        <td>Bovine Viral Diarrhea Vaccine</td>
                        <td>6 Months</td>
                        <td>1 Year</td>
                    </tr>
                    <tr>
                        <td>Pigs</td>
                        <td>Pseudorabies Vaccine</td>
                        <td>3 Months</td>
                        <td>1 Year</td>
                    </tr>
                    <tr>
                        <td>Poultry</td>
                        <td>Marek's Disease Vaccine</td>
                        <td>1 Day</td>
                        <td>N/A</td> <!-- Not applicable -->
                    </tr>
                    <tr>
                        <td>Sheep</td>
                        <td>Clostridial Vaccine</td>
                        <td>2 Months</td>
                        <td>1 Year</td>
                    </tr>
                    <tr>
                        <td>Goats</td>
                        <td>Enterotoxemia Vaccine</td>
                        <td>2 Months</td>
                        <td>1 Year</td>
                    </tr>
                    <tr>
                        <td>Horses</td>
                        <td>Tetanus Toxoid Vaccine</td>
                        <td>6 Months</td>
                        <td>1 Year</td>
                    </tr>
                    <tr>
                        <td>Cattle</td>
                        <td>Foot-and-Mouth Disease Vaccine</td>
                        <td>6 Months</td>
                        <td>6 Months</td>
                    </tr>
                    <tr>
                        <td>Swine</td>
                        <td>Swine Influenza Vaccine</td>
                        <td>4 Weeks</td>
                        <td>1 Year</td>
                    </tr>
                    <tr>
                        <td>Dogs (Livestock Guardian)</td>
                        <td>Rabies Vaccine</td>
                        <td>3 Months</td>
                        <td>3 Years</td>
                    </tr>
                    <tr>
                        <td>Goats</td>
                        <td>Caprine Arthritis Encephalitis Vaccine</td>
                        <td>6 Months</td>
                        <td>1 Year</td>
                    </tr>
                </tbody>
            </table>
            

            <!-- Additional Information Section -->
            <div class="container" style="margin-top: 50px;">
                <h2>Important Notes:</h2>
                <ul>
                    <li>Always consult with a veterinarian before starting any vaccination program.</li>
                    <li>Keep vaccination records for each animal to track their vaccination history.</li>
                    <li>Ensure that all vaccines are stored and handled according to manufacturer instructions.</li>
                </ul>
            </div>

        </div>
    </main>

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
                        <i class="fas fa-home mr-3"> Windhoek, NUST, Namibia</i>
                        <i class="fas fa-envelope mr-3"> farmsafe@gmail.com</i>
                        <i class="fas fa-phone mr-3">+264 200 000</i>
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
