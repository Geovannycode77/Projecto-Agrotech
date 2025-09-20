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
                                <a class="nav-link mx-lg-z  content-font2" aria-current="page" href="vaccination.php">Vaccination</a>
                            </li>
                            <li class="nav-item me-3">
                                <a class="nav-link mx-lg-z active content-font2" aria-current="page" href="disease-info.php">Disease</a>
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
                <form action="disease-info.php" method="POST"><input class="login-button content-font2" style="border: solid 0px;" type="submit" name="logout" value="LogOut"></input></form>
                <button class="navbar-toggler pe-0" type="button" data-bs-toggle="offcanvas"
                    data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
            </div>
        </nav>
    </header>

    <div class="bg-light p-3" style="margin-top: 80px; ">
        <div class="container" style="padding-bottom: 15px;">
            <h1 class="text-center" style="margin-bottom: 0px; padding-top: 10px;">Disease Info</h1>
            <p class="text-center">Understand common livestock diseases and learn about prevention, symptoms, and treatment options.</p>
            <div class="input-group mb-3 mt-3">
                <input type="text" class="form-control" placeholder="Search a disease">
                <button" class="btn btn-primary" type="button">Search</button>
            </div>
        </div>
    </div>
    <main class="container mt-5">
        <div class="row row-cols-1 row-cols-md-3 g-4">
            <!-- Disease Card 1 -->
            <div class="col">
                <div class="card h-100">
                    <div class="card-body header">
                        <h5 class="card-title font-weight-bold">Foot and Mouth Disease</h5>
                        <h6>Symptoms</h6>
                        <p>Fever, blisters in mouth and feet, excessive drooling.</p>
                        <h6>Treatment</h6>
                        <p>No direct treatment; supportive care and isolating infected animals can help control the spread.</p>
                        <h6>Prevention</h6>
                        <p>Regular vaccination, strict biosecurity, and quarantining new animals.</p>
                    </div>
                </div>
            </div>
            <!-- Disease Card 2 -->
            <div class="col">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title font-weight-bold">Bovine Respiratory Disease (BRD)</h5>
                        <h6>Symptoms</h6>
                        <p>Coughing, nasal discharge, fever, and rapid breathing.</p>
                        <h6>Treatment</h6>
                        <p>Antibiotics, anti-inflammatories, and good ventilation to reduce stress​</p>
                        <h6>Prevention</h6>
                        <p>Vaccinate for pathogens like IBR, BVD, and Pasteurella; reduce stress and overcrowding.</p>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title font-weight-bold">Bovine Viral Diarrhea (BVD)</h5>
                        <h6>Symptoms</h6>
                        <p> Diarrhea, weight loss, respiratory issues, and reproductive problems.</p>
                        <h6>Treatment</h6>
                        <p>No cure; supportive care and culling persistently infected animals is recommended.</p>
                        <h6>Prevention</h6>
                        <p>Vaccination and screening of new animals to prevent introduction to the herd.</p>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title font-weight-bold">Mastitis</h5>
                        <h6>Symptoms</h6>
                        <p> Swollen, red, or painful udders, decreased milk production, and discharge.</p>
                        <h6>Treatment</h6>
                        <p>Antibiotics and anti-inflammatory medications; culling chronic cases.</p>
                        <h6>Prevention</h6>
                        <p>Good milking hygiene, proper equipment maintenance, and teat disinfection.</p>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title font-weight-bold">Brucellosis</h5>
                        <h6>Symptoms</h6>
                        <p>Abortions, infertility, and retained placenta.</p>
                        <h6>Treatment</h6>
                        <p>No effective treatment; culling infected animals and strict biosecurity are recommended​</p>
                        <h6>Prevention</h6>
                        <p>Vaccination and testing of herds, avoiding unregulated animal purchases.</p>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title font-weight-bold">Johne’s Disease</h5>
                        <h6>Symptoms</h6>
                        <p>Chronic diarrhea, weight loss, and reduced milk production.</p>
                        <h6>Treatment</h6>
                        <p>No effective treatment; culling affected animals is common practice.</p>
                        <h6>Prevention</h6>
                        <p>Maintain closed herds, avoid manure contamination in feed, and test new animals.</p>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title font-weight-bold">Anthrax</h5>
                        <h6>Symptoms</h6>
                        <p> Sudden death, fever, difficulty breathing, and bloody discharge.</p>
                        <h6>Treatment</h6>
                        <p> Antibiotics if detected early; isolation and disposal of carcasses to prevent spread.</p>
                        <h6>Prevention</h6>
                        <p>Vaccination in high-risk areas and proper disposal of infected carcasses.</p>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title font-weight-bold">Blackleg</h5>
                        <h6>Symptoms</h6>
                        <p>  Sudden onset of lameness, swelling, and gas in tissues.</p>
                        <h6>Treatment</h6>
                        <p>Antibiotics in early stages, although often fatal; vaccination is key.</p>
                        <h6>Prevention</h6>
                        <p>Vaccination, especially in young animals, and managing soil contamination.</p>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title font-weight-bold">Leptospirosis</h5>
                        <h6>Symptoms</h6>
                        <p> Fever, jaundice, bloody urine, and abortions.</p>
                        <h6>Treatment</h6>
                        <p>Antibiotics, supportive care, and vaccination for herd protection</p>
                        <h6>Prevention</h6>
                        <p>Vaccination, rodent control, and sanitation of water sources.</p>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title font-weight-bold">Paratuberculosis (Johne’s Disease)</h5>
                        <h6>Symptoms</h6>
                        <p> Persistent diarrhea and rapid weight loss.</p>
                        <h6>Treatment</h6>
                        <p>No cure; manage through biosecurity and culling infected animals.
                        </p>
                        <h6>Prevention</h6>
                        <p>Regular testing, quarantine, and manure management to prevent calf exposure.</p>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title font-weight-bold">Newcastle Disease (in Poultry)</h5>
                        <h6>Symptoms</h6>
                        <p>Respiratory distress, greenish diarrhea, and neurological symptoms.</p>
                        <h6>Treatment</h6>
                        <p>No specific treatment; vaccination and supportive care reduce mortality.</p>
                        <h6>Prevention</h6>
                        <p>Vaccination and strict biosecurity practices.</p>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title font-weight-bold">Swine Flu (Influenza A Virus in Swine)
                        </h5>
                        <h6>Symptoms</h6>
                        <p> Coughing, fever, nasal discharge, and reduced appetite.</p>
                        <h6>Treatment</h6>
                        <p>Supportive care, hydration, and limiting exposure to other animals and people.</p>
                        <h6>Prevention</h6>
                        <p>Vaccination, biosecurity, and reducing human-swine contact.</p>
                    </div>
                </div>
            </div>
        </div>
    </main>
    <footer style="background-color: #132e2e;"  class="text-white pt-5 pb-4 mt-5">

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
