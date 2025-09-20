<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <link rel="stylesheet" href="../css/styles.css"> <!-- Link to your custom CSS -->
    <title>Forgot Password - FarmSafe</title>
</head>

<body>
    <!-- Back to Login button -->
    <div class="mt-2 container" style="text-align: right;">
        <a href="login.php"><button type="button" class="btn btn-outline-info">Back to Login</button></a>
    </div>

    <!-- Forgot Password Form -->
    <div class="d-flex flex-column vh-100 justify-content-center align-items-center">
        <div class="container custom-container px-5 pt-5 rounded" style="background-color: rgba(0, 0, 0, 0.555)">
            <div class="row text-center">
                <div class="col">
                    <h1 class="logo">FarmSafe</h1>
                    <p>Preventing Disease, Protecting Livestock</p>
                </div>
            </div>

            <!-- Form -->
            <div class="row text-left">
                <form id="forgot-password-form" method="POST" action="../php/forgot-password.php">
                    <!-- Email input -->
                    <div class="mb-3 text-left">
                        <label for="email" class="form-label">Enter your email address</label>
                        <input type="email" class="form-control" id="email" name="email" placeholder="Your email"
                            required>
                    </div>

                    <!-- Submit button -->
                    <div class="row">
                        <div class="col-12 text-center">
                            <div class="mb-3"><input class="btn btn-primary w-100" type="submit"
                                    value="Send Reset Link"></div>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Footer -->
            <p class='text-center'>© FarmSafe, Inc. 2024</p>
        </div>
    </div>

    <!-- Scripts -->
    <script src="../js/script.js"></script> <!-- Link to JavaScript file -->
    <script src='https://code.jquery.com/jquery-3.5.1.slim.min.js'></script> <!-- Include jQuery for Bootstrap JS -->
    <script src='https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js'></script> <!-- Include Popper.js for Bootstrap JS -->
     <!-- Include Bootstrap JS -->
     <script src='https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js' integrity='sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz' crossorigin='anonymous'></script>

</body>

</html>