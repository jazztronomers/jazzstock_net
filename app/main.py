from jazzstock_net.app.routes import user, stock, simulation, customize
import jazzstock_net.app.config.config as cf
from flask import Flask, render_template, request, jsonify, send_from_directory, session, redirect, url_for, Response
from datetime import timedelta
import decimal
import flask.json

class MyJSONEncoder(flask.json.JSONEncoder):

    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            # Convert decimal instances to strings.
            return str(obj)
        return super(MyJSONEncoder, self).default(obj)


application = Flask(__name__, static_folder='static', )
application.config['SECRET_KEY'] = cf.FLASK_SECRET_KEY
application.config['JSON_SORT_KEYS'] = False
application.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=31)
application.json_encoder = MyJSONEncoder



application.register_blueprint(user.application_user)
application.register_blueprint(stock.application_stock)
application.register_blueprint(simulation.application_simulation)
application.register_blueprint(customize.application_customize)

@application.route('/')
def rendering_page_home():
    return render_template('home.html',
                           username=session.get('username','Guest'),
                           expiration_date=str(session.get('expiration_date',None)),
                           recent_trading_days=[],
                           quarter_current='YYMM',
                           alert_message=session.get('message'))


@application.route('/register', methods=['GET'])
def rendering_page_register():
    return render_template('register.html')


@application.route('/customize', methods=['GET'])
def rendering_page_customize():
    if session.get('loggedin') == True:
        return render_template('customize.html', username=session.get('username','zzzzzz'))
    else:
        return redirect(url_for("home"),code=302)


@application.route('/profile', methods=['GET'])
def rendering_page_profile():
    if session.get('loggedin') == True:
        return render_template('profile.html', username=session.get('username','zzzzzz'), telegram_chat_id=session.get('telegram_chat_id',None))
    else:
        return redirect(url_for("home"),code=302)


@application.route('/ads.txt')
def static_from_root():
    return send_from_directory(application.static_folder, request.path[1:])


@application.route('/test', methods=['POST'])
def test():
    print(request.json)
    return jsonify({"yo":"yo"})


if __name__ == '__main__':
    application.run(debug=True, host='0.0.0.0', port=9002)
