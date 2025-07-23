import React from 'react';

const TermsAndConditions = () => {
  return (
    <div className="page">
      <div className="container">
        <div className="form-container" style={{ maxWidth: '800px' }}>
          <h2 className="text-center mb-4">Terms and Conditions</h2>
          
          <div style={{ textAlign: 'left', lineHeight: '1.6' }}>
            <h3>1. Acceptance of Terms</h3>
            <p>
              By accessing and using Study Group Finder, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h3>2. User Responsibilities</h3>
            <p>Users are responsible for:</p>
            <ul>
              <li>Providing accurate and truthful information during registration</li>
              <li>Maintaining the confidentiality of their account credentials</li>
              <li>Using the platform in a respectful and appropriate manner</li>
              <li>Not sharing inappropriate content or materials</li>
            </ul>

            <h3>3. Study Group Guidelines</h3>
            <p>When creating or joining study groups, users must:</p>
            <ul>
              <li>Respect all group members and maintain a positive learning environment</li>
              <li>Share only relevant and appropriate study materials</li>
              <li>Follow group rules and guidelines set by group creators</li>
              <li>Not use groups for commercial or promotional purposes</li>
            </ul>

            <h3>4. Privacy Policy</h3>
            <p>
              We respect your privacy and are committed to protecting your personal information. 
              We will not share your personal details with third parties without your consent.
            </p>

            <h3>5. Content Policy</h3>
            <p>Users must not post:</p>
            <ul>
              <li>Offensive, abusive, or inappropriate content</li>
              <li>Copyrighted materials without permission</li>
              <li>Spam or promotional content</li>
              <li>False or misleading information</li>
            </ul>

            <h3>6. Account Termination</h3>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms and conditions.
            </p>

            <h3>7. Modifications</h3>
            <p>
              We reserve the right to modify these terms at any time. Users will be notified of any significant changes.
            </p>

            <h3>8. Contact Information</h3>
            <p>
              For questions about these terms, please contact us at: support@studygroupfinder.com
            </p>

            <p className="mt-4">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
