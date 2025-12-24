import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PersonalCard: React.FC = () => {
    const [name, setName] = useState<string>('');
    const [contact, setContact] = useState<string>('');
    const [showCard, setShowCard] = useState<boolean>(false);

    const generateCard = () => {
        if (name.trim() && contact.trim()) {
            setShowCard(true);
        } else {
            alert('لطفاً نام و شماره تماس را وارد کنید.');
        }
    };

    const downloadPDF = () => {
        const cardElement = document.getElementById('card');
        if (!cardElement) return;

        html2canvas(cardElement, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height],
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save('kart-shakhsi.pdf');
        });
    };

    return (
        <div style={{ textAlign: 'center', direction: 'rtl', fontFamily: 'Vazirmatn, Tahoma, sans-serif', padding: '20px' }}>
            <h2>ساخت کارت شخصی</h2>

            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="نام کامل"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ padding: '10px', margin: '10px', width: '250px', fontSize: '16px' }}
                />
                <br />
                <input
                    type="text"
                    placeholder="شماره تماس"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    style={{ padding: '10px', margin: '10px', width: '250px', fontSize: '16px' }}
                />
                <br />
                <button
                    onClick={generateCard}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    ساخت کارت
                </button>
            </div>

            {showCard && (
                <div>
                    <div
                        id="card"
                        style={{
                            width: '400px',
                            height: '250px',
                            border: '2px solid #333',
                            borderRadius: '15px',
                            padding: '30px',
                            margin: '30px auto',
                            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>
                            {name}
                        </p>
                        <p style={{ fontSize: '20px', margin: '10px 0' }}>
                            شماره تماس: {contact}
                        </p>
                    </div>

                    <button
                        onClick={downloadPDF}
                        style={{
                            padding: '12px 24px',
                            fontSize: '18px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        دانلود به صورت PDF
                    </button>
                </div>
            )}
        </div>
    );
};

export default PersonalCard;
