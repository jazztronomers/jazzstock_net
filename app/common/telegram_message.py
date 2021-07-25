import telepot
import sys
import jazzstock_net.app.config.config as cf

_TOKEN = cf.TELEBOT_TOKEN
_RECEIVER = cf.TELEBOT_DEBUG
_BOT = telepot.Bot(_TOKEN)


def send_message_telegram(message, to=_RECEIVER):
    '''

    탤래그램으로 메세지를 직접 보내는 함수

    :param message: dictionary
    :return:
    '''

    try:
        ret = _BOT.sendMessage(to, '%s' % (message))
        return ret
    except Exception as e:
        return e.description

def send_image_telegram(image_path):
    _BOT.sendPhoto(_RECEIVER, photo=open(image_path, 'rb'))


if __name__ == '__main__':

    if len(sys.argv) == 1:
        send_image_telegram('profileImage.png')
    else:
        send_message_telegram(sys.argv[1])
