

// Função para animar os elementos ao rolar
function animateOnScroll() {
    const elements = document.querySelectorAll('.animate-on-scroll');

    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        // Verifica se o elemento está visível na tela
        if (elementTop < windowHeight - 100) { // 100px antes de chegar ao elemento
            if (!element.classList.contains('visible')) {
                element.classList.add('visible'); // Adiciona a classe apenas se não estiver presente
            }
        } else {
            element.classList.remove('visible'); // Remove a classe quando o elemento sai da viewport
        }
    });
}



// Lógica para o link ativo na navbar
document.addEventListener('DOMContentLoaded', function () {
    const sections = document.querySelectorAll('section'); // Todas as seções
    const navLinks = document.querySelectorAll('.navbar a'); // Todos os links da navbar
    const navbarHeight = document.querySelector('header').offsetHeight; // Altura da navbar

    window.addEventListener('scroll', () => {
        let current = ''; // Armazena o ID da seção visível

        sections.forEach(section => {
            const sectionTop = section.offsetTop - navbarHeight; // Ajusta a posição do topo da seção
            const sectionHeight = section.clientHeight; // Altura da seção
            const sectionBottom = sectionTop + sectionHeight; // Posição do final da seção

            // Verifica se o scroll está dentro da seção com um pequeno offset
            if (window.scrollY >= sectionTop - 100 && window.scrollY < sectionBottom - 100) {
                current = section.getAttribute('id'); // Pega o ID da seção visível
            }
        });

        // Adiciona a classe 'active' ao link correspondente
        navLinks.forEach(link => {
            link.classList.remove('active'); // Remove a classe 'active' de todos os links
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active'); // Adiciona a classe 'active' ao link correspondente
            }
        });
    });
});

// Rolagem suaao clicar nos links da navbar
// Rolagem suave ao clicar nos links da navbar (apenas para âncoras internas)
document.querySelectorAll('.navbar a').forEach(link => {
    link.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        
        // Verifica se o link é uma âncora interna (começa com #)
        if (targetId.startsWith('#')) {
            e.preventDefault(); // Só previne o comportamento padrão para links internos
            const targetSection = document.querySelector(targetId);
            const navbarHeight = document.querySelector('header').offsetHeight;

            if (targetSection) {
                const offset = targetSection.offsetTop - navbarHeight;
                window.scrollTo({
                    top: offset,
                    behavior: 'smooth',
                });
            }
        }
        // Se não for um link interno (#), o comportamento padrão (abrir página) é mantido
    });
});

// Adiciona um listener para o evento de scroll (animação ao rolar)
window.addEventListener('scroll', animateOnScroll);

const conteiner = document.getElementById('conteiner');
const registrarBtn = document.getElementById('registrar');
const entrarBtn = document.getElementById('entrar');

registrarBtn.addEventListener('click', () => {
    conteiner.classList.add("active");
});

entrarBtn.addEventListener('click', () => {
    conteiner.classList.remove("active");
});
