import smtplib
from email.mime.text import MIMEText


def send_mail(from_mail, to_mail, app_pw, code):
    # from_mail = 'jazztronomers@gmail.com'
    app_pw = 'xikpzqcgegkzuyvx'
    title = 'jazzstock 회원가입 인증메일입니다.'
    content = 'jazzstock 회원가입 인증코드는 다음과 같습니다.\n%s'%(code)

    s = smtplib.SMTP('smtp.gmail.com', 587)
    s.starttls()
    s.login(from_mail, app_pw)
    msg = MIMEText(content)
    msg['Subject'] = title
    s.sendmail(from_mail, to_mail, msg.as_string())
    s.quit()


if __name__ == "__main__":
    import random
    send_mail("rubenchu@naver.com", random.randint(0, 999999))