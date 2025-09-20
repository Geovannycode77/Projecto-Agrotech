<?php
// include 'db.php';
// session_start();

// if (!isset($_SESSION['username'])) { 
//     header("Location: index.php"); 
//     exit();
// }

// if(isset($_POST['logout'])){
//     session_destroy();
//     header("Location: ../php/index.php");
//     exit();
// }

$successMessage = '';

// Check if form was submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['disease_name']) && isset($_POST['description'])) {

    // Check if fields are empty
    if (empty($_POST['disease_name']) || empty($_POST['description'])) {
        $successMessage = "Please complete the form";
    } else {
        $disease_name = $_POST['disease_name'];
        $description = $_POST['description'];
        $reported_by = $_SESSION['username'];

        // Insert disease report into database
        $sql = "INSERT INTO diseases (disease_name, description, reported_by) VALUES (?,?,?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sss", $disease_name, $description, $reported_by);

        if ($stmt->execute()) {
            $successMessage = "Disease report submitted successfully!";
            // Redirect to avoid form resubmission
            header("Location: report-disease.php?success=1");
            exit();
        }

        $stmt->close();
        $conn->close();
    }
}

// Show success message after redirect
if (isset($_GET['success']) && $_GET['success'] == 1) {
    $successMessage = "Disease report submitted successfully!";
}

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
                                <a class="nav-link mx-lg-z  content-font2" aria-current="page" href="disease-info.php">Disease</a>
                            </li>
                            <li class="nav-item me-3">
                                <a class=" active nav-link mx-lg-z  content-font2" aria-current="page" href="report-disease.php">Report</a>
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
                <form action="report-disease.php" method="POST"><input class="login-button content-font2" style="border: solid 0px;" type="submit" name="logout" value="LogOut"></input></form>
                <button class="navbar-toggler pe-0" type="button" data-bs-toggle="offcanvas"
                    data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
            </div>
        </nav>
    </header>

    <div class="report-disease container-fluid">
        <div class="bd-example">
            <h1 class="text-center" style="margin-bottom:10px;color: white;">Report Livestock Disease</h1>

            <?php if ($successMessage): ?>
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    <?php echo $successMessage; ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            <?php endif; ?> 

            <form method="POST" action="report-disease.php">
                <div class="form-floating mb-3">
                    <input name="disease_name" type="text" class="form-control" id="diseaseName" placeholder=" " required>
                    <label for="diseaseName">Disease Name</label>
                </div>
                <div class="form-floating mb-3">
                    <textarea name="description" style="height: 200px;" class="form-control" id="description" placeholder=" " required></textarea>
                    <label for="description">Description</label>
                </div>
                <button type="submit" class="btn btn-primary">Submit</button>
            </form>
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