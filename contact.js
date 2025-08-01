// Simulated backend storage
let contacts = JSON.parse(localStorage.getItem('portfolioContacts')) || [];

// DOM elements
const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const btnLoading = document.getElementById('btnLoading');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const contactsList = document.getElementById('contactsList');

// Simulated backend API
class ContactAPI {
    static async saveContact(contactData) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate random API failure (10% chance)
        if (Math.random() < 0.1) {
            throw new Error('Server error occurred');
        }

        // Add contact to storage
        const contact = {
            id: Date.now(),
            ...contactData,
            timestamp: new Date().toISOString(),
            status: 'new'
        };

        contacts.unshift(contact);
        localStorage.setItem('portfolioContacts', JSON.stringify(contacts));
        return contact;
    }

    static async deleteContact(id) {
        await new Promise(resolve => setTimeout(resolve, 300));
        contacts = contacts.filter(contact => contact.id !== id);
        localStorage.setItem('portfolioContacts', JSON.stringify(contacts));
    }

    static getContacts() {
        return contacts;
    }

    static async updateContactStatus(id, status) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const contactIndex = contacts.findIndex(contact => contact.id === id);
        if (contactIndex !== -1) {
            contacts[contactIndex].status = status;
            contacts[contactIndex].updatedAt = new Date().toISOString();
            localStorage.setItem('portfolioContacts', JSON.stringify(contacts));
        }
    }
}

// Form validation
function validateForm(formData) {
    const errors = [];
    
    if (!formData.firstName.trim()) errors.push('First name is required');
    if (!formData.lastName.trim()) errors.push('Last name is required');
    if (!formData.email.trim()) errors.push('Email is required');
    if (!formData.subject) errors.push('Subject is required');
    if (!formData.message.trim()) errors.push('Message is required');
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
        errors.push('Please enter a valid email address');
    }

    // Phone validation (if provided)
    if (formData.phone && formData.phone.trim()) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
            errors.push('Please enter a valid phone number');
        }
    }

    return errors;
}

// Show/hide messages
function showMessage(element, duration = 5000) {
    element.style.display = 'block';
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    setTimeout(() => {
        element.style.display = 'none';
    }, duration);
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Get subject display name
function getSubjectDisplayName(subject) {
    const subjectMap = {
        'web-development': 'Web Development Project',
        'consultation': 'Consultation',
        'collaboration': 'Collaboration',
        'other': 'Other'
    };
    return subjectMap[subject] || subject;
}

// Form submission handler
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(form);
    const contactData = Object.fromEntries(formData.entries());

    // Validate form
    const errors = validateForm(contactData);
    if (errors.length > 0) {
        errorMessage.textContent = errors.join('. ') + '.';
        showMessage(errorMessage);
        return;
    }

    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-block';

    try {
        // Save contact via simulated API
        const savedContact = await ContactAPI.saveContact(contactData);
        
        // Show success message
        successMessage.textContent = `Thank you ${contactData.firstName}! Your message has been saved successfully.`;
        showMessage(successMessage);
        
        // Reset form
        form.reset();
        
        // Refresh contacts list
        renderContacts();

        // Log success for debugging
        console.log('Contact saved:', savedContact);

    } catch (error) {
        console.error('Error saving contact:', error);
        errorMessage.textContent = 'Failed to save contact. Please try again.';
        showMessage(errorMessage);
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        btnText.style.display = 'inline-block';
        btnLoading.style.display = 'none';
    }
});

// Render contacts list
function renderContacts() {
    const contacts = ContactAPI.getContacts();
    
    if (contacts.length === 0) {
        contactsList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No contacts saved yet.</p>';
        return;
    }

    contactsList.innerHTML = contacts.map(contact => `
        <div class="contact-item" data-id="${contact.id}">
            <button class="delete-btn" onclick="deleteContact(${contact.id})">Delete</button>
            <strong>${contact.firstName} ${contact.lastName}</strong>
            <span style="background: #007bff; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.7rem; margin-left: 10px;">${contact.status.toUpperCase()}</span>
            <br>
            <span><strong>Email:</strong> ${contact.email}</span><br>
            ${contact.phone ? `<span><strong>Phone:</strong> ${contact.phone}</span><br>` : ''}
            ${contact.company ? `<span><strong>Company:</strong> ${contact.company}</span><br>` : ''}
            <span><strong>Subject:</strong> ${getSubjectDisplayName(contact.subject)}</span><br>
            <span><strong>Message:</strong> ${contact.message.length > 100 ? contact.message.substring(0, 100) + '...' : contact.message}</span><br>
            <span><strong>Received:</strong> ${formatDate(contact.timestamp)}</span>
            ${contact.updatedAt ? `<br><span><strong>Updated:</strong> ${formatDate(contact.updatedAt)}</span>` : ''}
            <div style="margin-top: 10px;">
                <button onclick="markAsRead(${contact.id})" style="background: #28a745; color: white; border: none; padding: 3px 8px; border-radius: 3px; font-size: 0.8rem; margin-right: 5px; cursor: pointer;">Mark as Read</button>
                <button onclick="markAsReplied(${contact.id})" style="background: #ffc107; color: black; border: none; padding: 3px 8px; border-radius: 3px; font-size: 0.8rem; cursor: pointer;">Mark as Replied</button>
            </div>
        </div>
    `).join('');
}

// Delete contact
async function deleteContact(id) {
    if (confirm('Are you sure you want to delete this contact?')) {
        try {
            // Add loading state to the contact item
            const contactItem = document.querySelector(`[data-id="${id}"]`);
            if (contactItem) {
                contactItem.style.opacity = '0.5';
                contactItem.style.pointerEvents = 'none';
            }

            await ContactAPI.deleteContact(id);
            renderContacts();
            
            // Show success message
            successMessage.textContent = 'Contact deleted successfully.';
            showMessage(successMessage, 3000);
            
        } catch (error) {
            console.error('Error deleting contact:', error);
            alert('Failed to delete contact. Please try again.');
            
            // Reset contact item state
            const contactItem = document.querySelector(`[data-id="${id}"]`);
            if (contactItem) {
                contactItem.style.opacity = '1';
                contactItem.style.pointerEvents = 'auto';
            }
        }
    }
}

// Mark contact as read
async function markAsRead(id) {
    try {
        await ContactAPI.updateContactStatus(id, 'read');
        renderContacts();
        successMessage.textContent = 'Contact marked as read.';
        showMessage(successMessage, 2000);
    } catch (error) {
        console.error('Error updating contact:', error);
        alert('Failed to update contact status.');
    }
}

// Mark contact as replied
async function markAsReplied(id) {
    try {
        await ContactAPI.updateContactStatus(id, 'replied');
        renderContacts();
        successMessage.textContent = 'Contact marked as replied.';
        showMessage(successMessage, 2000);
    } catch (error) {
        console.error('Error updating contact:', error);
        alert('Failed to update contact status.');
    }
}

// Search/Filter functionality
function createSearchFilter() {
    const searchContainer = document.createElement('div');
    searchContainer.innerHTML = `
        <div style="margin-bottom: 20px;">
            <input type="text" id="searchInput" placeholder="Search contacts..." style="width: 70%; padding: 10px; border: 2px solid #e1e5e9; border-radius: 5px; margin-right: 10px;">
            <select id="statusFilter" style="width: 25%; padding: 10px; border: 2px solid #e1e5e9; border-radius: 5px;">
                <option value="">All Status</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
            </select>
        </div>
    `;
    
    const contactsListTitle = document.querySelector('.contacts-list h3');
    contactsListTitle.insertAdjacentElement('afterend', searchContainer);
    
    // Add event listeners
    document.getElementById('searchInput').addEventListener('input', filterContacts);
    document.getElementById('statusFilter').addEventListener('change', filterContacts);
}

// Filter contacts based on search and status
function filterContacts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    const filteredContacts = contacts.filter(contact => {
        const matchesSearch = !searchTerm || 
            contact.firstName.toLowerCase().includes(searchTerm) ||
            contact.lastName.toLowerCase().includes(searchTerm) ||
            contact.email.toLowerCase().includes(searchTerm) ||
            contact.company?.toLowerCase().includes(searchTerm) ||
            contact.message.toLowerCase().includes(searchTerm);
            
        const matchesStatus = !statusFilter || contact.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    renderFilteredContacts(filteredContacts);
}

// Render filtered contacts
function renderFilteredContacts(filteredContacts) {
    if (filteredContacts.length === 0) {
        contactsList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No contacts found matching your criteria.</p>';
        return;
    }
    
    // Use the same rendering logic but with filtered contacts
    contactsList.innerHTML = filteredContacts.map(contact => `
        <div class="contact-item" data-id="${contact.id}">
            <button class="delete-btn" onclick="deleteContact(${contact.id})">Delete</button>
            <strong>${contact.firstName} ${contact.lastName}</strong>
            <span style="background: #007bff; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.7rem; margin-left: 10px;">${contact.status.toUpperCase()}</span>
            <br>
            <span><strong>Email:</strong> ${contact.email}</span><br>
            ${contact.phone ? `<span><strong>Phone:</strong> ${contact.phone}</span><br>` : ''}
            ${contact.company ? `<span><strong>Company:</strong> ${contact.company}</span><br>` : ''}
            <span><strong>Subject:</strong> ${getSubjectDisplayName(contact.subject)}</span><br>
            <span><strong>Message:</strong> ${contact.message.length > 100 ? contact.message.substring(0, 100) + '...' : contact.message}</span><br>
            <span><strong>Received:</strong> ${formatDate(contact.timestamp)}</span>
            ${contact.updatedAt ? `<br><span><strong>Updated:</strong> ${formatDate(contact.updatedAt)}</span>` : ''}
            <div style="margin-top: 10px;">
                <button onclick="markAsRead(${contact.id})" style="background: #28a745; color: white; border: none; padding: 3px 8px; border-radius: 3px; font-size: 0.8rem; margin-right: 5px; cursor: pointer;">Mark as Read</button>
                <button onclick="markAsReplied(${contact.id})" style="background: #ffc107; color: black; border: none; padding: 3px 8px; border-radius: 3px; font-size: 0.8rem; cursor: pointer;">Mark as Replied</button>
            </div>
        </div>
    `).join('');
}

// Add smooth animations for form interactions
function initializeFormAnimations() {
    document.querySelectorAll('input, textarea, select').forEach(element => {
        element.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
            this.parentElement.style.transition = 'transform 0.3s ease';
        });
        
        element.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });
}

// Export data functionality
function exportContacts() {
    const contacts = ContactAPI.getContacts();
    if (contacts.length === 0) {
        alert('No contacts to export.');
        return;
    }
    
    const csvContent = [
        'First Name,Last Name,Email,Phone,Company,Subject,Message,Status,Received,Updated',
        ...contacts.map(contact => 
            `"${contact.firstName}","${contact.lastName}","${contact.email}","${contact.phone || ''}","${contact.company || ''}","${getSubjectDisplayName(contact.subject)}","${contact.message.replace(/"/g, '""')}","${contact.status}","${formatDate(contact.timestamp)}","${contact.updatedAt ? formatDate(contact.updatedAt) : ''}"`
        )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio_contacts_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Add export button
function createExportButton() {
    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export CSV';
    exportBtn.onclick = exportContacts;
    exportBtn.style.cssText = `
        background: #17a2b8; color: white; border: none; padding: 8px 15px; 
        border-radius: 5px; cursor: pointer; font-size: 0.9rem; margin-left: 10px;
        transition: background 0.3s ease;
    `;
    exportBtn.onmouseover = () => exportBtn.style.background = '#138496';
    exportBtn.onmouseout = () => exportBtn.style.background = '#17a2b8';
    
    const contactsTitle = document.querySelector('.contacts-list h3');
    contactsTitle.appendChild(exportBtn);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    renderContacts();
    initializeFormAnimations();
    createSearchFilter();
    createExportButton();
    
    // Log initial state for debugging
    console.log('Portfolio Contact Form initialized');
    console.log('Existing contacts:', contacts.length);
});

// Handle page visibility change to refresh data
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Refresh contacts when page becomes visible (in case data was modified in another tab)
        contacts = JSON.parse(localStorage.getItem('portfolioContacts')) || [];
        renderContacts();
    }
});