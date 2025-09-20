<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <link rel="stylesheet" href="../css/styles.css"> <!-- Link to your custom CSS -->
    <title>Contact Us - FarmSafe</title>
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
                                <a class="nav-link mx-lg-z  content-font2" aria-current="page"
                                    href="home.php">Home</a>
                            </li>
                            <li class="nav-item me-3">
                                <a class="nav-link mx-lg-z  content-font2" aria-current="page" href="#">Article</a>
                            </li>
                            <li class="nav-item me-3">
                                <a class="nav-link mx-lg-z  content-font2" aria-current="page" href="#">Explore</a>
                            </li>
                            <li class="nav-item me-3">
                                <a class="nav-link mx-lg-z  content-font2" aria-current="page" href="#">Forum</a>
                            </li>
                            <li class="nav-item me-3">
                                <a class="nav-link mx-lg-z content-font2" href="#">About</a>
                            </li>
                        </ul>
                    </div>
                </div>
                <a href="#" class="login-button content-font2">Profile</a>
                <button class="navbar-toggler pe-0" type="button" data-bs-toggle="offcanvas"
                    data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
            </div>
        </nav>
    </header>

    <!-- Contact Us Section -->
    <section class='contact-us mt-5 pt-5'>
        <div class='container'>
            <!-- Contact Us Heading -->
            <h2 class='text-center mb-4'>Contact Us</h2>

            <!-- Contact Form -->
            <form id='contact-form' method='POST' action='../php/contact.php'>
                <!-- Name Input -->
                <div class='mb-3'>
                    <label for='name' class='form-label'>Name:</label>
                    <input type='text' class='form-control' id='name' name='name' placeholder='Your name' required />
                </div>

                <!-- Email Input -->
                <div class='mb-3'>
                    <label for='email' class='form-label'>Email:</label>
                    <input type='email' class='form-control' id='email' name='email' placeholder='Your email address'
                        required />
                </div>

                <!-- Message Input -->
                <div class='mb-3'>
                    <label for='message' class='form-label'>Message:</label>
                    <textarea class='form-control' id='message' name='message' rows='5'
                        placeholder='Your message...' required></textarea>
                </div>

                <!-- Submit Button -->
                <div class='text-center'>
                    <button type='submit' class='btn btn-primary'>Submit</button>
                </div>
            </form>

        </div> <!-- End of container -->
    </section>

    <!-- Footer Section (Same as about.php) -->
    <footer class='bg-dark text-white pt-5 pb-4'>
        <!-- Footer Content -->
        <div class='container text-left text-md-left'>
            <!-- Footer Row -->
            FarmSafe
            Explore detailed disease guides, track vaccination schedules, report outbreaks, and join a community forum
            designed for farmers, veterinarians, and agricultural students to promote healthier livestock management.
        </div>

        Useful Links
        Forum
        Report
        About

        <!-- Footer Bottom Row -->
        Copyrights ©2024 All rights reserved by:
        FarmSafe
    </footer>

    <!-- Scripts -->
    <script src="../js/script.js"></script> <!-- Link to JavaScript file -->
    <script src='https://code.jquery.com/jquery-3.5.1.slim.min.js'></script> <!-- Include jQuery for Bootstrap JS -->
    <script src='../js/popper.min.js'></script> <!-- Include Popper.js for Bootstrap JS -->
    <!-- Include Bootstrap JS -->
    <script src='../js/bootstrap.bundle.min.js'></script>

</body>

</html>