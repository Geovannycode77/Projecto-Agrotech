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
                                <a class="nav-link active mx-lg-z  content-font2" aria-current="page" href="resources.php">Library</a>
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
                <form action="resources.php" method="POST"><input class="login-button content-font2" style="border: solid 0px;" type="submit" name="logout" value="LogOut"></input></form>
                <button class="navbar-toggler pe-0" type="button" data-bs-toggle="offcanvas"
                    data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
            </div>
        </nav>
    </header>
    <div class="bg-light p-3" style="margin-top: 80px;">
        <div class="container" style="padding-bottom: 15px;">
            <h1 style="margin-bottom: 0px; padding-top: 10px;" class="text-center">Resource Library</h1>
            <p class="text-center">Browse through articles, research papers, and guidelines for better livestock management.</p>
            <div class="input-group mb-3 mt-3">
                <input type="text" class="form-control" placeholder="Search resources...">
                <button" class="btn btn-primary" type="button">Search</button>
            </div>
        </div>
    </div>

    <main class="container mt-5">
        <div class="row row-cols-1 row-cols-md-3 g-4">
            <!-- Resource Card 1 -->
            <div class="col">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">Basic Livestock Health Plan</h5>
                        <p class="card-text">A Basic plan to help you keep your livestock healthy</p>
                        <a href="https://agribank.com.na/download/p1cbu4d7gu2016701uvg3if1c664.pdf" class="btn btn-primary" target="_blank">View Resource</a>
                    </div>
                </div>
            </div>
            <!-- Resource Card 2 -->
            <div class="col">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">Livestock Management Guide</h5>
                        <p class="card-text">Best practices for disease prevention and herd health maintenance.</p>
                        <a href="https://extension.umn.edu/dairy-handling-and-best-practices/livestock-farm-management" type="target" class="btn btn-primary" target="_blank">View Resource</a>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">Economic Impact of Foot and Mouth Disease (FMD)</h5>
                        <p class="card-text">Examines the economic effects of FMD on international trade and the costs associated with disease control.</p>
                        <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC3989032/#:~:text=This%20paper%20estimates%20that%20annual,US%241.5%20billion%20a%20year." class="btn btn-primary" target="_blank">View Resource</a>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">Strategies for Disease Prevention in Livestock</h5>
                        <p class="card-text">Describes methods to prevent disease spread in livestock through biosecurity, vaccination, and quarantine protocols.</p>
                        <a href="https://agritech.tnau.ac.in/expert_system/cattlebuffalo/general%20disease%20prevention.php" target="_blank" class="btn btn-primary">View Resource</a>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">Management of Ruminant Diseases in Ghana</h5>
                        <p class="card-text">Discusses disease management in ruminant livestock, emphasizing veterinary service delivery and common diseases in Ghanaian farms.</p>
                        <a href="https://bmcvetres.biomedcentral.com/articles/10.1186/s12917-023-03793-z" class="btn btn-primary" target="_blank">View Resource</a>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">Common Cattle Diseases and Prevention
                        </h5>
                        <p class="card-text">Covers preventive strategies for cattle diseases, including vaccination and nutrition guidelines.</p>
                        <a href="https://www.veterinariadigital.com/en/articulos/common-diseases-in-cattle/" class="btn btn-primary" target="_blank">View Resource</a>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">The Role of Biosecurity in Livestock Health
                        </h5>
                        <p class="card-text">Highlights biosecurity measures such as isolation and hygiene to minimize disease risks.</p>
                        <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC9582555/" class="btn btn-primary" target="_blank">View Resource</a>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">Reducing Antibiotic Use in Livestock
                        </h5>
                        <p class="card-text">Focuses on reducing antibiotic dependence and improving livestock health through management strategies.</p>
                        <a href="https://www.ncbi.nlm.nih.gov/books/NBK232568/" class="btn btn-primary" target="_blank">View Resource</a>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">African Swine Fever: Prevention and Control
                        </h5>
                        <p class="card-text">Provides insights into the transmission and management of African Swine Fever in pig populations.</p>
                        <a href="https://www.msschippers.com/advice/the-5-steps-to-prevent-african-swine-fever#:~:text=To%20achieve%20this%2C%2C%20it's%20crucial,control%20incoming%20goods%20and%20visitors." class="btn btn-primary" target="_blank">View Resource</a>
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
