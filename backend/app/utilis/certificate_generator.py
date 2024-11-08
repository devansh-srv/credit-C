def generate_certificate_data(purchase_id, user, purchased_credit, credit):
    return {
        "certificate_id": f"CC-{purchase_id}-{user.id}",
        "buyer_name": user.username,
        "credit_name": credit.name,
        "amount": purchased_credit.amount,
        "purchase_date": purchased_credit.purchase_date.strftime("%Y-%m-%d"),
        "certificate_html": f"""
            <div style="border: 2px solid #2c3e50; padding: 20px; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                <h1 style="text-align: center; color: #2c3e50;">Carbon Credit Certificate</h1>
                <div style="text-align: center; margin-bottom: 20px;">
                    <p>This certifies that</p>
                    <h2>{user.username}</h2>
                    <p>has purchased</p>
                    <h3>{purchased_credit.amount} {credit.name}</h3>
                    <p>on {purchased_credit.purchase_date.strftime("%B %d, %Y")}</p>
                </div>
                <div style="margin-top: 40px; text-align: center;">
                    <p>Certificate ID: CC-{purchase_id}-{user.id}</p>
                </div>
            </div>
        """
    }
