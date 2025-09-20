<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <link rel="stylesheet" href="../css/styles.css"> <!-- Link to your custom CSS -->
    <title>Reset Password - FarmSafe</title>
</head>

<style>
    body {
        background-image: url('/images/horse-6724544_1280.jpg'); 
        background-size: cover; 
        background-position: center; 
        background-repeat: no-repeat;
    }

    p {
        font-family: Roboto;
        color: white;
    }

    label {
        color: white;
    }

    @media (min-width: 576px) {
        .custom-container {
            max-width: 500px;
        }
    }
    @media (min-width: 768px) {
        .custom-container {
            max-width: 500px;
        }
    }
    @media (min-width: 992px) {
        .custom-container {
            max-width: 500px; 
        }
    }
    @media (min-width: 1200px) {
        .custom-container {
            max-width: 600px;
        }
    }
</style>

<body>
    <!-- Back to Login button -->
    <div class="mt-2 container" style="text-align: right;">
        <a href="login.html"><button type="button" class="btn btn-outline-info">Back to Login</button></a>
    </div>

    <!-- Reset Password form -->
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
                <form id="reset-password-form" method="POST" action="../php/reset-password.php">
                    <!-- Hidden field for token -->
                    <input type="hidden" name="token" value="<?php echo $_GET['token']; ?>">

                    <!-- New Password input -->
                    <div class="mb-3 text-left">
                        <label for="new_password" class="form-label">New Password</label>
                        <input type="password" class="form-control" id="new_password" name="new_password" placeholder="Enter new password" required>
                    </div>

                    <!-- Confirm New Password input -->
                    <div class="mb-3 text-left">
                        <label for="confirm_password" class="form-label">Confirm New Password</label>
                        <input type="password" class="form-control" id="confirm_password" name="confirm_password" placeholder="Confirm new password" required>
                    </div>

                    <!-- Submit button -->
                    <div class="row">
                        <div class="col-12 text-center">
                            <div class="mb-3"><input class="btn btn-primary w-100" type="submit" value="Reset Password"></div>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Footer -->
            <p class="text-center">© FarmSafe, Inc. 2024</p>
        </div>
    </div>

    <!-- Scripts -->
    <script src="../js/script.js"></script> <!-- Link to JavaScript file -->
    <script src='https://code.jquery.com/jquery-3.5.1.slim.min.js'></script> <!-- Include jQuery for Bootstrap JS -->
    <script src='https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js'></script> <!-- Include Popper.js for Bootstrap JS -->
     <!-- Include Bootstrap JS -->
     <script src='https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js' integrity='sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz' crossorigin='anonymous'></script>

     <!-- Client-side validation for matching passwords -->
     <script>
         document.getElementById('reset-password-form').addEventListener('submit', function(e) {
             const newPassword = document.getElementById('new_password').value;
             const confirmPassword = document.getElementById('confirm_password').value;

             if (newPassword !== confirmPassword) {
                 alert("Passwords do not match!");
                 e.preventDefault(); // Prevent form submission if passwords don't match
             }
         });
     </script>

</body>
</html>