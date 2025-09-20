<?php 
// session_start();
// include 'db.php'; // Assuming `db.php` contains your database connection setup

// if (!isset($_SESSION['username'])) { 
//     header("Location: index.php"); 
//     exit();
// }

// if (isset($_POST['logout'])) {
//     session_destroy();
//     header("Location: ../php/index.php");
//     exit();
// }

// Initialize variables
$successMessage = '';
$errorMessage = '';

// Handle new thread form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['threadTitle'])) {
    $threadTitle = $_POST['threadTitle'];
    $threadCategory = $_POST['threadCategory'];
    $threadContent = $_POST['threadContent'];
    $username = $_SESSION['username'];

    if (!empty($threadTitle) && !empty($threadContent)) {
        // Insert the new thread into the database
        $sql = "INSERT INTO threads (title, category, content, created_by) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssss", $threadTitle, $threadCategory, $threadContent, $username);

        if ($stmt->execute()) {
            $successMessage = "Thread created successfully!";
        } else {
            $errorMessage = "Error creating thread.";
        }
        
        $stmt->close();
    } else {
        $errorMessage = "Please fill out all fields.";
    }
}

// Fetch existing threads from the database
$threads = [];
$sql = "SELECT * FROM threads ORDER BY created_at DESC";
$result = $conn->query($sql);
if ($result->num_rows > 0) {
    $threads = $result->fetch_all(MYSQLI_ASSOC);
}
$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet">


        <link rel="stylesheet" href="../css/styles.css"> Link to your custom CSS
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
                                <a class="nav-link mx-lg-z  content-font2" aria-current="page" href="report-disease.php">Report</a>
                            </li>
                            <li class="nav-item me-3">
                                <a class="nav-link mx-lg-z active content-font2" aria-current="page" href="Forum.php">Forum</a>
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

    <main class="container my-5">
        <h1 class="text-center mb-4" style="font-weight: bold; margin-top: 130px; font-family: Playwrite GB S, cursive;">FarmSafe Forum</h1>

        <!-- New Thread Button and Modal -->
        <div class="text-center mb-4">
            <button class="thread-button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#newThreadModal">New Thread</button>
        </div>

        <!-- Success and Error Messages -->
        <?php if ($successMessage): ?>
            <div class="alert alert-success"><?php echo $successMessage; ?></div>
        <?php endif; ?>
        <?php if ($errorMessage): ?>
            <div class="alert alert-danger"><?php echo $errorMessage; ?></div>
        <?php endif; ?>

        <!-- Display Threads -->
        <?php foreach ($threads as $thread): ?>
    <div class="card mb-4">
        <div style="background-color: #132E2E" class="card-header">
            <h4>
            <a class="thread-link" href="view-thread.php?thread_id=<?php echo $thread['thread_id']; ?>">
                    <?php echo htmlspecialchars($thread['title']); ?>
                </a>
            </h4>
            <small style="color: grey;">Posted by <?php echo htmlspecialchars($thread['created_by']); ?> on <?php echo $thread['created_at']; ?></small>
        </div>
        <div style="background-color: #effdfd" class="card-body">
            <p><?php echo htmlspecialchars($thread['content']); ?></p>
        </div>
    </div>
    <?php endforeach; ?>


        

        <div class="modal fade" id="newThreadModal" tabindex="-1" aria-labelledby="newThreadModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header new-thread-header">
                        <h5 style="color:white" class="modal-title" id="newThreadModalLabel">Create New Thread</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body new-thread-body">
                        <form method="POST" action="forum.php">
                            <div class="mb-3">
                                <label for="threadTitle" class="form-label">Title</label>
                                <input type="text" class="form-control" name="threadTitle" id="threadTitle" required>
                            </div>
                            <div class="mb-3">
                                <label for="threadCategory" class="form-label">Category</label>
                                <select class="form-select" name="threadCategory" id="threadCategory" required>
                                    <option selected disabled>Choose category...</option>
                                    <option value="General">General Discussion</option>
                                    <option value="Disease">Disease Management</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="threadContent" class="form-label">Content</label>
                                <textarea class="form-control" name="threadContent" id="threadContent" rows="4" required></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary">Post Thread</button>
                        </form>
                    </div>
                </div>
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

    <script src="../js/script.js"></script>
</body>
</html>
