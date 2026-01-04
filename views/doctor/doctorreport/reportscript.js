document.addEventListener('DOMContentLoaded', () => {
    // Utility for image previews
    const setupImagePreview = (inputId, imgId) => {
        const input = document.getElementById(inputId);
        const target = document.getElementById(imgId);

        input.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    target.src = e.target.result;
                    target.style.display = 'block';

                    // Update label text to show filename
                    const label = this.parentElement.querySelector('.file-label');
                    if (label) label.innerHTML = `<i class="ri-check-line"></i> ${this.files[0].name.substring(0, 15)}...`;
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    };

    setupImagePreview('logo', 'rLogo');
    setupImagePreview('sign', 'rSign');
});

function generate() {
    // Collect Data
    const fields = [
        'hospital', 'doctor', 'qual', 'reg',
        'patient', 'mode', 'complaints',
        'diagnosis', 'advice', 'followup'
    ];

    // Map fields to report
    fields.forEach(id => {
        const val = document.getElementById(id).value;
        const target = document.getElementById('r' + id.charAt(0).toUpperCase() + id.slice(1));
        if (target) target.innerText = val || 'N/A';
    });

    // Special Fields
    document.getElementById('rDoctor2').innerText = document.getElementById('doctor').value;
    document.getElementById('rReg2').innerText = document.getElementById('reg').value;

    // Time Calc
    const startStr = document.getElementById('start').value;
    const endStr = document.getElementById('end').value;

    if (!startStr || !endStr) {
        alert("Please select both Start and End times.");
        return;
    }

    const start = new Date(startStr);
    const end = new Date(endStr);
    const mins = Math.round((end - start) / 60000);

    document.getElementById('rDate').innerText = start.toLocaleDateString();
    document.getElementById('rStart').innerText = start.toLocaleString();
    document.getElementById('rEnd').innerText = end.toLocaleString();
    document.getElementById('rDuration').innerText = mins + " minutes";
    document.getElementById('rTimestamp').innerText = new Date().toLocaleString();

    // Toggle Views
    document.getElementById('formSection').style.display = 'none';
    document.getElementById('report').style.display = 'block';

    // Scroll to top
    window.scrollTo(0, 0);
}

function editForm() {
    document.getElementById('formSection').style.display = 'block';
    document.getElementById('report').style.display = 'none';
    window.scrollTo(0, 0);
}


